You are improving a deep-sea themed portfolio site. The site is built and functional.
Your job is to make it better — one task at a time.

1. Read CLAUDE.md for the full design system, component map, and conventions.
2. Read TODO.md and pick the top incomplete task.
3. Check `git log --oneline -5` to see recent work.
4. Implement the task. Follow CLAUDE.md for colors, fonts, and conventions.
   Use your judgment for creative and structural decisions not covered there.
5. Run `npm run dev` in the background. Open the site in a browser and verify
   your change looks correct — check desktop and mobile widths. If you can't
   verify visually, note what you checked and what you couldn't.
6. Run `npm run build` — fix any errors before committing.
7. Commit with `feat(section): description` or `fix(section): description`.
8. Update TODO.md: mark the task [x]. If you notice anything worth fixing,
   add it under the appropriate phase or Backlog.
9. If CLAUDE.md no longer matches reality after your change (new component,
   changed architecture, etc.), update CLAUDE.md to reflect what you built.
10. Exit.

Rules:
- One task per iteration. If it's too big, break it into sub-tasks in TODO.md
  and complete the first one.
- Always follow the research, plan and implement strategy for each iteration
- Don't refactor code outside the current task's scope.
- Prioritize looking good over technical cleverness. If an effect doesn't look
  right, iterate on it before moving on.
- Test at both desktop (1440px) and mobile (375px) before committing.

When every task is done, write ALL_TASKS_COMPLETE as the first line of TODO.md.
