# AGENTS.md

## 1. LOYIHA TAHLILI

Bu loyiha Vite asosidagi React 18 + TypeScript frontend. Build va dev server `package.json` scriptlari orqali yuradi:

- `npm run dev` - Vite dev server
- `npm run build` - `tsc -b` va `vite build`
- `npm run lint` - ESLint
- `npm run preview` - Vite preview

Asosiy stack:

- Framework: React 18, Vite, TypeScript
- Routing: `react-router-dom` v6, `BrowserRouter`, `Routes`, `Route`, `Outlet`, `Navigate`, `lazy`
- Server state: `@tanstack/react-query`
- API client: `axios`, markaziy client `src/api/apiClient.ts`
- Forms: `formik`, `yup`
- Styling: Tailwind CSS, SCSS, plain CSS, Bootstrap va React Bootstrap aralash ishlatiladi
- Icons: `lucide-react`, `react-icons`, lokal SVG iconlar, `vite-plugin-svgr`
- UI/helper kutubxonalar: `flatpickr`, `react-phone-number-input`, `framer-motion`, `swiper`, `@vidstack/react`, `moment`
- Global app providerlar: `QueryClientProvider`, `BrowserRouter`, `Suspense`, `ThemeProvider`

Muhit sozlamalari:

- `.env.development`: `VITE_API_BASE_URL=http://127.0.0.1:8080/api`
- `.env.production`: `VITE_API_BASE_URL=/api`
- Agar env qiymati bo'lmasa, `apiClient` default sifatida `/api` ishlatadi.

TypeScript:

- `tsconfig.json` project references ishlatadi: `tsconfig.app.json`, `tsconfig.node.json`
- `tsconfig.app.json` strict rejimda: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- `allowImportingTsExtensions: true`, shuning uchun mavjud kodda `.tsx` va `.ts` extension bilan importlar ko'p uchraydi
- JSX mode: `react-jsx`
- Module resolution: `Bundler`

Styling:

- Tailwind config `tailwind.config.js` ichida `primary`, `brand`, `gray`, `success`, `error`, `warning` rang scale'lari bor
- Global style entry: `src/styles/index.scss`
- Legacy CSS/SCSS fayllar `src/styles/css` ichida
- Auth va dashboard UI'larda Tailwind classlar ko'p ishlatiladi
- Eski landing/template qismlarida Bootstrap classlari, SCSS va plain CSS ishlatiladi

State management:

- Redux, Zustand, Jotai yo'q
- Global UI state uchun Context ishlatiladi:
  - `src/layouts/ThemeContext.tsx`
  - `src/layouts/SidebarContext.tsx`
- Server state uchun React Query ishlatiladi
- Form state uchun Formik ishlatiladi
- Auth tokenlar `localStorage` helperlari orqali saqlanadi

API pattern:

- Har modul `src/api/<domain>` ichida joylashadi
- Odatdagi pattern:
  - `<domain>Api.ts` - raw axios requestlar
  - `use<Domain>.ts` - React Query hooklar
- `apiClient` request interceptor orqali `accessToken` header qo'shadi
- 401 bo'lsa refresh token bilan `/auth/refresh` chaqiriladi
- Xato handling ko'pincha `AxiosError<{ message: string }>` orqali message olib `throw new Error(message)` qiladi

Routing:

- Route entry: `src/route/index.tsx`
- Route ro'yxati: `src/route/allRoutes.tsx`
- Public route'lar `AuthLayout` ichida render bo'ladi
- Protected route'lar `AuthProtected` + `DefaultLayout` ichida render bo'ladi
- Sahifalar lazy import qilinadi

Test:

- Hozir test fayllar topilmadi
- Jest, Vitest yoki Testing Library config topilmadi
- Test agenti mavjud test pattern yo'qligini hisobga olib faqat minimal tavsiya beradi, yangi test infra ixtiro qilmaydi

## 2. UMUMIY QOIDALAR

- Mavjud fayl uslubini saqla: komponentlar ko'pincha `function ComponentName()` yoki `function Index()` ko'rinishida yozilgan va default export qilinadi.
- Importlarda mavjud koddagi `.ts` va `.tsx` extensionlarni saqla.
- Yangi API kodini `src/api/<domain>` ichiga joylashtir: requestlar alohida `*Api.ts`, hooklar alohida `use*.ts`.
- UI komponentlarni umumiy bo'lsa `src/ui`, domain-specific bo'lsa `src/components/<domain>` ichiga qo'sh.
- Route qo'shilsa `src/route/allRoutes.tsx` ichida lazy import va route object qo'shiladi.
- Auth yoki dashboard layoutga ta'sir qiladigan o'zgarishlarda `AuthLayout`, `DefaultLayout`, `HeaderOne`, `Header_new`, sidebar va theme context bilan moslikni tekshir.
- Tailwind classlar mavjud tokenlarga tayansin: `primary`, `brand`, `gray`, `success`, `error`, `warning`.
- Mavjud Bootstrap/SCSS ishlatilgan eski template qismlarida to'liq Tailwind refactor qilma, shu fayl ichidagi uslubni saqla.
- `localStorage` bilan ishlashda to'g'ridan-to'g'ri API ishlatishdan oldin `src/utils/utils.ts` helperlarini tekshir.
- Token, env, production deploy qiymatlarini kod ichiga hardcode qilma.
- `dist`, `node_modules`, `*.tsbuildinfo` fayllarini qo'lda tahrir qilma.
- Mavjud local o'zgarishlarni revert qilma. Ayniqsa `.env.production`, `src/api/apiClient.ts` kabi fayllar dirty bo'lishi mumkin.

Naming convention:

- Components: PascalCase fayl nomlari (`CourseCard.tsx`, `ProfilePage.tsx`) yoki domain folder ichida `index.tsx`
- Hooks: `useSomething.ts`
- API request fayllari: `<domain>Api.ts`
- Type/interface: PascalCase
- Form field nomlari backend DTO bilan mos yoziladi (`birthday`, `parentPhone`, `phoneNumber`, `courseId`)
- Query keys odatda string array: `["courses"]`, `["continue-learning"]`, `["role", id]`

Import tartibi:

- Avval React/router/library importlar
- Keyin API hooklar va local helperlar
- Keyin local UI/componentlar
- Keyin asset/type importlar
- Mavjud faylda boshqa tartib bo'lsa, shu fayl tartibini buzma

## 3. SUB-AGENT ROLLARI

### Code Reader Agent

Maqsad: mavjud kodni minimal context bilan o'qib, aniq joyni topish.

Qachon ishlatiladi:

- Bug qayerdan chiqayotganini aniqlash
- Yangi taskdan oldin mavjud patternni topish
- Biror feature qaysi komponent, route yoki API hookda ekanini aniqlash

Qoidalar:

- Avval `rg` va `rg --files` ishlatadi
- Kerakli fayllarning faqat relevant qismini o'qiydi
- Patternni mavjud koddan ko'rsatadi: fayl nomi, funksiya, hook, route
- Xulosa qisqa bo'ladi

Taqiqlangan:

- Kod yozmaydi
- Refactor taklifini implementation sifatida boshlamaydi
- Taxminni fakt sifatida yozmaydi

Output format:

- `Topildi:` fayl va qisqa izoh
- `Pattern:` mavjud kod qanday ishlashi
- `Keyingi joy:` o'zgartirilishi kerak bo'lgan fayl

### Component Builder Agent

Maqsad: mavjud UI patternlarga mos React komponent yozish yoki mavjud komponentni kengaytirish.

Qachon ishlatiladi:

- Yangi UI komponent kerak bo'lsa
- `src/ui` yoki `src/components/<domain>` ichida component qo'shilsa
- Form, card, modal, list item, dropdown kabi elementlar kerak bo'lsa

Qoidalar:

- TypeScript props type yoki interface yozadi
- Umumiy qayta ishlatiladigan komponent `src/ui` ichiga ketadi
- Domain-specific komponent `src/components/<domain>` ichida qoladi
- Default export patternini saqlaydi
- Tailwind classlar va mavjud design tokenlardan foydalanadi
- Loading/disabled/error state kerak bo'lsa mavjud `Spinner`, `CommonButton`, `Alert` kabi UI komponentlarni tekshiradi

Taqiqlangan:

- Yangi design system yaratmaydi
- Mavjud Bootstrap qismini sabab bo'lmasa Tailwindga ko'chirmaydi
- API chaqiruvni component ichida raw `axios` bilan yozmaydi

Output format:

- O'zgargan komponentlar
- Props va state qisqa tavsifi
- Tekshiruv natijasi

### Refactor Agent

Maqsad: mavjud behaviorni buzmasdan kodni soddalashtirish.

Qachon ishlatiladi:

- Bir faylda takroriy logic ko'paysa
- `useEffect` bilan derived state kechikish buglari chiqsa
- Component juda kattalashib ketgan bo'lsa
- API yoki helper pattern bir xil bo'lmay qolsa

Qoidalar:

- Behavior saqlanadi
- Avval public surface aniqlanadi: props, route, API response, localStorage key
- Kichik va review qilish oson patch qiladi
- Formik/Yup logicda derived validation to'g'ridan-to'g'ri form valuesdan hisoblanadi
- Refactordan keyin `npm run build` ishlatiladi

Taqiqlangan:

- Bir task ichida butun arxitekturani almashtirmaydi
- Route nomlarini, storage keylarni yoki API endpointlarni sababsiz o'zgartirmaydi
- Dirty unrelated fayllarni formatlamaydi

Output format:

- `Saqlangan behavior:`
- `O'zgargan ichki tuzilma:`
- `Tekshiruv:`

### API/Data Fetching Agent

Maqsad: backend bilan ishlaydigan request va React Query hooklarni loyiha patterniga mos yozish.

Qachon ishlatiladi:

- Yangi endpoint ulanadi
- Query yoki mutation kerak bo'ladi
- Auth token, refresh, error handling bilan bog'liq bug chiqadi

Qoidalar:

- Raw request `src/api/<domain>/<domain>Api.ts` ichida yoziladi
- Hook `src/api/<domain>/use<Domain>.ts` ichida yoziladi
- `apiClient` ishlatiladi, raw `axios` faqat refresh kabi maxsus holatlarda
- Querylarda `enabled` id bor-yo'qligiga bog'lanadi
- Mutationlarda navigation yoki cache invalidation kerak bo'lsa hook ichida qilinadi
- Error uchun mavjud `AxiosError<{ message: string }>` patternini saqla

Taqiqlangan:

- Component ichida endpoint stringlarini ko'paytirmaydi
- Tokenni qo'lda har requestga qo'shmaydi
- `fetch` ishlatmaydi

Output format:

- Endpointlar
- Query/mutation hook nomlari
- Cache/query keylar
- Error/loading handling

### State Agent

Maqsad: client state va server state chegarasini to'g'ri ushlash.

Qachon ishlatiladi:

- Theme, sidebar, modal, mobile UI kabi client state kerak bo'lsa
- Serverdan keladigan data lifecycle boshqarilsa
- Form state yoki derived state buglari bo'lsa

Qoidalar:

- Server data uchun React Query
- Form data uchun Formik
- Global UI state uchun Context
- Oddiy local interaction uchun `useState`
- Derived state imkon qadar render vaqtida hisoblanadi

Taqiqlangan:

- Redux/Zustand/Jotai qo'shmaydi
- Server data'ni Contextga ko'chirmaydi
- `useEffect`ni faqat derived value hisoblash uchun ishlatmaydi

Output format:

- State turi: server, form, global UI yoki local
- Qayerda saqlanishi
- Yangilanish triggerlari

### Page/Layout Agent

Maqsad: route, page va layout qatlamlarini loyiha routing patterniga mos boshqarish.

Qachon ishlatiladi:

- Yangi sahifa qo'shiladi
- Protected/public route o'zgaradi
- Header, sidebar, auth layout yoki default layout o'zgaradi

Qoidalar:

- Sahifa `src/pages` yoki mavjud domain component orqali ulanadi
- Route `src/route/allRoutes.tsx` ichida lazy import bilan qo'shiladi
- Public sahifalar `publicRoutes`, private sahifalar `authProtectedRoutes` ichiga qo'shiladi
- Protected sahifa default layout ichida ishlashini tekshir
- Auth sahifa `AuthLayout` ichida ishlashini tekshir

Taqiqlangan:

- Router providerini ko'paytirmaydi
- `main.tsx`dagi provider tartibini sababsiz o'zgartirmaydi
- Existing route pathlarni migration rejasisiz almashtirmaydi

Output format:

- Route path
- Layout turi
- Page/component fayl
- Navigation link kerak bo'lsa qayerga qo'shilgani

### UI Component Agent

Maqsad: `src/ui` va mavjud shared UI elementlarini izchil ishlatish.

Qachon ishlatiladi:

- Button, input, date picker, phone input, alert, badge, image, spinner kabi umumiy UI kerak bo'lsa
- Existing UI componentga prop qo'shish kerak bo'lsa

Qoidalar:

- Avval `src/ui` ichidan mavjud komponent qidiriladi
- Auth formalarda `InputField`, `PhoneNumberInput`, `AuthDatePicker`, `AuthText`, `CommonButton` ishlatiladi
- Button loading state uchun mavjud `Spinner` ishlatiladi
- Asset kerak bo'lsa `src/assets` ichidagi mavjud logo/iconlardan foydalaniladi

Taqiqlangan:

- Bir xil button/inputning yangi variantini sababsiz yaratmaydi
- Mavjud `AuthDatePicker` yoki `PhoneNumberInput`ni chetlab o'tmaydi
- UI kitni tashqi dependency bilan almashtirmaydi

Output format:

- Ishlatilgan existing UI komponentlar
- Yangi prop yoki variantlar
- Visual/regression risk

### Test Agent

Maqsad: test yo'qligini hisobga olib, xavfni build/lint va manual tekshiruv bilan yopish.

Qachon ishlatiladi:

- Bug fixdan keyin regression risk bor bo'lsa
- Form validation, routing, API hook yoki auth flow o'zgarsa
- Kelajakda test infra qo'shish kerak bo'lsa

Qoidalar:

- Hozir test framework yo'q deb qabul qiladi
- Minimal tekshiruv: `npm run build`
- Zarur bo'lsa `npm run lint`
- Manual scenario yozadi: login, register, course open, logout kabi
- Yangi test framework faqat alohida task bo'lsa tavsiya qilinadi

Taqiqlangan:

- Jest/Vitest configni yashirincha qo'shmaydi
- Snapshot yoki broad test infra yaratmaydi

Output format:

- `Automated:` build/lint natijasi
- `Manual:` tekshirilgan flowlar
- `Risk:` qolgan xavf

## 4. KOMPONENT STANDARTI

Props:

- Kichik komponentlarda `type Props = { ... }` ishlatiladi
- Ba'zi fayllarda `interface ComponentName { ... }` uchraydi; mavjud fayl uslubini saqla
- Props nomlari aniq bo'lsin: `isPending`, `disabled`, `className`, `onClick`, `children`
- API response typelar `src/types/types.ts` yoki domain-local `types.ts` ichiga joylanadi

Export:

- Ko'p komponentlar default export qiladi
- Context provider va hooklarda named export bor (`ThemeProvider`, `useSidebar`)
- Existing module export uslubini buzma

Fayl/papka:

- Page wrapperlar `src/pages`
- Domain UI `src/components/<domain>`
- Shared UI `src/ui`
- Domain API `src/api/<domain>`
- Shared types `src/types`
- Shared helperlar `src/utils`

Komponent ichidagi mantiq:

- UI componentlar raw API chaqirmaydi
- Page/domain componentlar hook chaqirib data olib render qiladi
- Murakkab formatlash helperga chiqariladi, lekin faqat real takrorlanish bo'lsa
- Formlarda validation `Yup` schema ichida, submit logic `onSubmit` ichida bo'ladi

## 5. FAYL TUZILMASI STANDARTI

Yangi sahifa:

- `src/pages/<Name>Page.tsx` yoki mavjud domain bo'lsa `src/pages/<domain>/<Name>.tsx`
- Route uchun `src/route/allRoutes.tsx`
- Agar katta feature bo'lsa render component `src/components/<domain>/index.tsx`

Yangi component:

- Reusable: `src/ui/<Name>.tsx`
- Domain-specific: `src/components/<domain>/<Name>.tsx`
- Domain entry: `src/components/<domain>/index.tsx`

Yangi API:

- Request: `src/api/<domain>/<domain>Api.ts`
- Hook: `src/api/<domain>/use<Domain>.ts`
- Type: domain-local `types.ts` yoki `src/types/types.ts`

Yangi hook:

- Cross-domain hook: `src/hooks/use<Name>.ts`
- API hook emas bo'lsa `src/api` ichiga qo'yilmaydi

Yangi style:

- Component-local bo'lsa Tailwind classlar afzal
- Legacy template style kerak bo'lsa `src/styles/css` ichidagi mavjud SCSS/CSS patternini saqla
- Global importlar `src/styles/index.scss` orqali yuradi

## 6. GIT COMMIT FORMAT

Mavjud commit log qisqa imperative yoki umumiy message uslubida:

- `Deploy academy build to nginx dist root`
- `Fix deploy target for academy.westep.uz`
- `Sync app from working copy and replace Brainzone branding`
- `Remove Brainzone branding and update dashboard logos`
- `changes`
- `fixed`

Yangi commitlar uchun aniqroq imperative format ishlat:

- `Fix register birthday validation`
- `Add course purchase API hook`
- `Update academy deploy target`
- `Refactor profile learning stats`

Qoidalar:

- Bir commit bitta aniq maqsadga xizmat qilsin
- Deploy/config va UI change alohida bo'lsa alohida commit qil
- Dirty unrelated fayllarni commitga qo'shma

## 7. TEZ YO'RIQNOMA

Yangi sahifa qo'shish:

1. Code Reader Agent route va layout patternini topadi
2. Page/Layout Agent page fayl va lazy route qo'shadi
3. Component Builder Agent domain UI yozadi
4. Test Agent `npm run build` bilan tekshiradi

Yangi komponent qo'shish:

1. Code Reader Agent o'xshash componentni topadi
2. UI Component Agent reusable yoki domain-specific joyni tanlaydi
3. Component Builder Agent props type va default export bilan yozadi
4. Test Agent build/lint tekshiradi

API ulash:

1. Code Reader Agent mavjud `src/api/<domain>` patternini topadi
2. API/Data Fetching Agent `*Api.ts` request yozadi
3. API/Data Fetching Agent `use*.ts` React Query hook qo'shadi
4. Component Builder Agent hookni UIga ulaydi
5. Test Agent loading/error/success flowlarni tekshiradi

State qo'shish:

1. State Agent state turini aniqlaydi
2. Server data bo'lsa React Query, form bo'lsa Formik, global UI bo'lsa Context ishlatadi
3. Component Builder Agent state'ni UIga ulaydi
4. Test Agent regression flowlarni tekshiradi

Bug fix:

1. Code Reader Agent bug manbasini fayl va line darajasida topadi
2. Tegishli agent patch qiladi: Component, API, State yoki Page/Layout
3. Refactor Agent faqat zarur bo'lsa ichki mantiqni soddalashtiradi
4. Test Agent `npm run build` va manual scenario bilan tekshiradi

Refactor:

1. Code Reader Agent public behavior va dependencylarni ro'yxatlaydi
2. Refactor Agent kichik patch qiladi
3. API/Data yoki State Agent tegishli chegaralarni tekshiradi
4. Test Agent build va asosiy user flowlarni tekshiradi

Register/auth flow o'zgartirish:

1. Code Reader Agent `src/components/auth`, `src/ui`, `src/api/auth` fayllarini topadi
2. UI Component Agent mavjud `AuthText`, `InputField`, `PhoneNumberInput`, `AuthDatePicker`, `CommonButton` patternini saqlaydi
3. State Agent Formik/Yup validationni form valuesdan hisoblaydi
4. API/Data Fetching Agent auth hook va token flowga tegsa `apiClient` bilan mosligini tekshiradi
5. Test Agent register, login, logout, protected redirect flowlarni tekshiradi
