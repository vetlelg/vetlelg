#!/bin/bash
# run-loop.sh — Autonomous development loop using Claude Code
#
# Usage:
#   chmod +x run-loop.sh
#   ./run-loop.sh                  # runs with defaults (sonnet, high effort)
#   ./run-loop.sh --model opus     # use opus
#   ./run-loop.sh --effort high    # set effort level (low/medium/high)
#   ./run-loop.sh --max 20         # cap at 20 iterations
#   ./run-loop.sh --delay 30       # 30 seconds between iterations
#
# Stop it:
#   Ctrl+C, or let it hit the max iteration cap,
#   or the agent writes ALL_TASKS_COMPLETE to TODO.md

set -euo pipefail

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------
MAX_ITERATIONS=15
DELAY_SECONDS=10
MODEL="sonnet"
EFFORT="high"
PROMPT_FILE="prompt.md"
TODO_FILE="TODO.md"
LOG_DIR=".loop-logs"
COMPLETION_MARKER="ALL_TASKS_COMPLETE"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --max)       MAX_ITERATIONS="$2"; shift 2 ;;
    --delay)     DELAY_SECONDS="$2"; shift 2 ;;
    --model)     MODEL="$2"; shift 2 ;;
    --effort)    EFFORT="$2"; shift 2 ;;
    --prompt)    PROMPT_FILE="$2"; shift 2 ;;
    *)           echo "Unknown option: $1"; exit 1 ;;
  esac
done

# -------------------------------------------------------------------
# Preflight checks
# -------------------------------------------------------------------
if ! command -v claude &> /dev/null; then
  echo "Error: claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: $PROMPT_FILE not found. Create it first."
  exit 1
fi

if [ ! -f "$TODO_FILE" ]; then
  echo "Error: $TODO_FILE not found. Create it first."
  exit 1
fi

if [ ! -f "CLAUDE.md" ]; then
  echo "Warning: CLAUDE.md not found. The agent will have no project context."
fi

# Create log directory
mkdir -p "$LOG_DIR"

# -------------------------------------------------------------------
# The loop
# -------------------------------------------------------------------
ITERATION=0
START_TIME=$(date +%s)

echo "========================================"
echo "  Autonomous Development Loop"
echo "========================================"
echo "  Prompt:         $PROMPT_FILE"
echo "  Model:          $MODEL"
echo "  Effort:         $EFFORT"
echo "  Max iterations: $MAX_ITERATIONS"
echo "  Delay:          ${DELAY_SECONDS}s between iterations"
echo "  Logs:           $LOG_DIR/"
echo "  Stop:           Ctrl+C or completion marker"
echo "========================================"
echo ""

# Trap Ctrl+C for clean exit
trap 'echo ""; echo "Loop stopped by user at iteration $ITERATION."; exit 0' INT

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  LOG_FILE="$LOG_DIR/iteration-$(printf '%03d' $ITERATION).log"

  echo "[$TIMESTAMP] === Iteration $ITERATION / $MAX_ITERATIONS ==="

  # Run Claude Code with the prompt, fully autonomous
  # --dangerously-skip-permissions: no confirmation prompts
  # -p: non-interactive, single prompt mode
  # --output-format text: readable output for logs
  claude -p "$(cat "$PROMPT_FILE")" \
    --model "$MODEL" \
    --effort "$EFFORT" \
    --dangerously-skip-permissions \
    --output-format text \
    2>&1 | tee "$LOG_FILE"

  echo ""
  echo "[$TIMESTAMP] Iteration $ITERATION complete. Log: $LOG_FILE"

  # Check if the agent signaled completion
  if grep -q "$COMPLETION_MARKER" "$TODO_FILE" 2>/dev/null; then
    ELAPSED=$(( $(date +%s) - START_TIME ))
    echo ""
    echo "========================================"
    echo "  All tasks complete!"
    echo "  Iterations: $ITERATION"
    echo "  Time: $((ELAPSED / 60)) minutes"
    echo "========================================"
    exit 0
  fi

  # Check if the build is broken (optional safety check)
  if npm run build --silent 2>/dev/null; then
    echo "  Build: OK"
  else
    echo "  Build: FAILED — agent will see this next iteration"
  fi

  # Git status summary
  CHANGED=$(git diff --stat 2>/dev/null | tail -1)
  if [ -n "$CHANGED" ]; then
    echo "  Changes: $CHANGED"
  fi

  # Wait before next iteration
  if [ $ITERATION -lt $MAX_ITERATIONS ]; then
    echo "  Waiting ${DELAY_SECONDS}s before next iteration..."
    echo ""
    sleep "$DELAY_SECONDS"
  fi
done

ELAPSED=$(( $(date +%s) - START_TIME ))
echo ""
echo "========================================"
echo "  Max iterations ($MAX_ITERATIONS) reached."
echo "  Time: $((ELAPSED / 60)) minutes"
echo "  Check TODO.md for remaining tasks."
echo "========================================"
