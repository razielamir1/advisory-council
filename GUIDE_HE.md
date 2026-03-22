# מדריך שימוש — מערכת סוכני הפיתוח

## מה זה?

מערכת של 11 סוכני AI מומחים שעובדים יחד כצוות פיתוח מלא ב-Claude Code. לכל סוכן יש תפקיד, כלים, הרשאות, וזיכרון מתמשך.

## הסוכנים

| סוכן | תפקיד | מודל | הרשאות |
|---|---|---|---|
| **Lead Orchestrator** | מנתב משימות לסוכן המתאים | opus | מלאות |
| `architect` | ארכיטקטורה, עיצוב מערכת, סקלביליות | opus | קריאה בלבד |
| `frontend-developer` | לוגיקת React, state, routing, hooks | sonnet | קריאה + כתיבה |
| `ui-designer` | עיצוב ויזואלי, TailwindCSS, קומפוננטות | sonnet | קריאה + כתיבה |
| `backend-developer` | API routes, middleware, Express | sonnet | קריאה + כתיבה |
| `database-expert` | סכמות PostgreSQL, מיגרציות, queries | sonnet | קריאה + כתיבה |
| `devops-engineer` | CI/CD, Docker, deployment | sonnet | קריאה + כתיבה |
| `code-reviewer` | ביקורת קוד, best practices | opus | קריאה בלבד |
| `security-analyst` | ביקורת אבטחה, OWASP, פרצות | sonnet | קריאה בלבד |
| `performance-optimizer` | פרופיילינג, אופטימיזציה, caching | sonnet | קריאה + כתיבה |
| `qa-expert` | בדיקות, ציד באגים, כיסוי בדיקות | sonnet | קריאה בלבד |
| `tech-writer` | תיעוד API, README, JSDoc, מדריכים | sonnet | קריאה + כתיבה |

**סוכנים עם קריאה בלבד** (architect, code-reviewer, security-analyst, qa-expert) מייעצים ומדווחים — הם לעולם לא משנים קוד.

## התחלה מהירה

### אפשרות 1: פרויקט חדש (GitHub Template)

לחץ על **"Use this template"** ב-GitHub כדי ליצור ריפו חדש עם כל הסוכנים מוכנים.

אחרי היצירה:
1. פתח את הפרויקט ב-VSCode
2. ערוך את `CLAUDE.md` — עדכן את חלק ה-**Tech Stack** לפי הפרויקט שלך
3. התחל לדבר עם Claude — הסוכנים מוכנים

### אפשרות 2: הוספה לפרויקט קיים (Git Subtree)

שיטה זו מאפשרת למשוך עדכונים עתידיים לסוכנים.

**פעם ראשונה — הוספת סוכנים לפרויקט:**

```bash
# הוסף את הריפו כ-remote
git remote add agents https://github.com/razielamir1/LeadOrchestratorAgent.git
git fetch agents

# משוך את תיקיית .claude לפרויקט
git subtree add --prefix=.claude agents main --squash

# העתק את קובץ התצורה של האורקסטרטור
cp .claude/../CLAUDE.md ./CLAUDE.md
# ערוך את CLAUDE.md כדי להתאים לסטאק של הפרויקט שלך
```

**בעתיד — משיכת עדכונים לסוכנים:**

```bash
git subtree pull --prefix=.claude agents main --squash
```

### אפשרות 3: העתקה ידנית

```bash
cp -r /path/to/LeadOrchestratorAgent/.claude /path/to/your-project/
cp /path/to/LeadOrchestratorAgent/CLAUDE.md /path/to/your-project/
```

> שים לב: העתקה ידנית לא תומכת במשיכת עדכונים עתידיים.

## איך להשתמש

### האצלה אוטומטית
פשוט תאר מה אתה צריך. האורקסטרטור קורא את התיאור של כל סוכן ומאציל אוטומטית:

```
"תבנה לי טופס התחברות עם ולידציה"
→ frontend-developer (לוגיקה) + ui-designer (עיצוב) + qa-expert (בדיקות)
```

### הפעלה ישירה (@-mention)
פנה ישירות לסוכן ספציפי:

```
@architect תתכנן את הארכיטקטורה למערכת התראות בזמן אמת
@code-reviewer תעבור על הקוד ב-src/api/users.ts
@security-analyst תסרוק את הפרויקט לפרצות אבטחה
```

### שרשור (Chaining) — לפיצ'ר full-stack
הסוכנים רצים ברצף:

```
architect → database-expert → backend-developer → frontend-developer → ui-designer → qa-expert
```

### עבודה במקביל (Parallel)
משימות עצמאיות רצות בו-זמנית:

```
"תריץ את @code-reviewer ו-@security-analyst על src/ במקביל"
```

### הרצה ברקע
הרץ סוכנים ברקע בזמן שאתה ממשיך לעבוד:

```
"תריץ את @qa-expert ברקע לסרוק את כל הפרויקט"
```

אפשר גם ללחוץ **Ctrl+B** כדי להעביר משימה שכבר רצה לרקע.

### צפייה בכל הסוכנים
הקלד `/agents` בצ'אט כדי לראות תפריט אינטראקטיבי של כל הסוכנים הזמינים.

## תזרימי עבודה מומלצים

### פיצ'ר חדש (Full-Stack)
`architect` → `database-expert` → `backend-developer` → `frontend-developer` → `ui-designer` → `qa-expert`

### תיקון באג
`qa-expert` (אבחון) → סוכן פיתוח מתאים (תיקון) → `qa-expert` (אימות)

### ביקורת קוד + ביקורת אבטחה (במקביל)
`code-reviewer` + `security-analyst` → דוח

### פריסה (Deployment)
`devops-engineer` → `qa-expert` (אימות) → פריסה

### תיעוד
`tech-writer` → קורא את הקוד → מייצר תיעוד

## זיכרון מתמשך

כל סוכן מתחזק קובץ זיכרון משלו ב-`.claude/agent-memory/<שם-הסוכן>/MEMORY.md`. הסוכנים קוראים את הזיכרון שלהם בתחילת כל משימה ומעדכנים אותו בסיום.

זה אומר שהסוכנים **לומדים לאורך זמן** — סוכן ה-QA זוכר אזורים שבירים, הארכיטקט זוכר החלטות עיצוב קודמות, מומחה הבסיס נתונים זוכר היסטוריית סכמות.

הזיכרון הוא **לכל פרויקט בנפרד**, אז הסוכנים לומדים כל פרויקט באופן עצמאי.

## התאמה אישית

- **שינוי סטאק טכנולוגי:** ערוך את חלקי ה-`Tech Stack` וה-`Delegation Table` ב-`CLAUDE.md`
- **הוספת סוכן חדש:** צור קובץ `.md` חדש ב-`.claude/agents/` עם YAML frontmatter (name, description, model, tools) ופרומפט
- **שינוי סוכן קיים:** ערוך את קובץ ה-`.md` שלו ב-`.claude/agents/`
- **שינוי מודל של סוכן:** קבע `model: opus` לחשיבה עמוקה יותר או `model: sonnet` לתגובות מהירות יותר
- **הגבלת הרשאות:** הסר `Write` ו-`Edit` מהשדה `tools` כדי להפוך סוכן לקריאה בלבד
