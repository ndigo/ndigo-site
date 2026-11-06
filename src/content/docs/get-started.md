---
title: Get Started
description: Install Ndigo and run your first application in under five minutes.
---

import { Steps, Tabs, TabItem, Aside } from '@astrojs/starlight/components';

Ndigo targets **Node.js ≥ 24** and **pnpm ≥ 12**. Make sure both are installed
before continuing.

<Steps>

1. **Scaffold a new app**

   ```bash
   pnpm create ndigo-app my-app
   cd my-app
   ```

   The scaffold ships a minimal application with routing, a view, and a
   development server configured. See
   [`create-ndigo-app`](https://github.com/ndigo/ndigo/tree/main/packages/create-ndigo-app)
   for options.

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open the printed URL in your browser. You should see the starter page.

4. **Add your first route**

   Open `src/app.ts` (or the controller file the scaffold created) and add a
   route:

   ```ts
   import { routeMapping, ModelAndView } from '@ndigo/dispatcher';

   @routeMapping('/hello/:name')
   handleHello(name: string) {
       return new ModelAndView('hello', { name });
   }
   ```

5. **Create the view**

   Add a view component that renders the model:

   ```ts
   import { WebComponentView } from '@ndigo/view-webcomponent';

   export class HelloView extends WebComponentView {
       constructor() { super('hello-view'); }
   }
   ```

   Register it in your application configuration and you're done.

</Steps>

## Next steps

- Read the [Architecture overview](/guides/architecture/) to understand how
  context, routing, and views fit together.
- Browse the [example apps](https://github.com/ndigo/ndigo/tree/main/apps) for
  working patterns (auth, ORM, caching, real-time, and more).
- Explore the [API reference](/reference/) for package-level documentation.

<Aside type="tip">
  Prefer a specific feature? Ndigo ships focused packages — `@ndigo/orm`,
  `@ndigo/auth-*`, `@ndigo/cache`, `@ndigo/jobs`, `@ndigo/socket`, and more.
  Add only what your app needs.
</Aside>
EOF
echo done