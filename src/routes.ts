import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

// Halaman login/registrasi dimuat langsung (halaman pertama yang dilihat pengguna),
// sedangkan halaman dashboard dimuat lazy agar bundle awal lebih ringan.
const CashFlowLayout = () => import("./features/cashflows/layouts/CashFlowLayout.vue");
const HomePage = () => import("./features/cashflows/pages/HomePage.vue");
const DetailPage = () => import("./features/cashflows/pages/DetailPage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "login", name: "login", component: LoginPage },
      { path: "register", name: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: CashFlowLayout,
    children: [
      { path: "", name: "home", component: HomePage },
      { path: "cash-flows/:cashFlowId", name: "cash-flow-detail", component: DetailPage },
      { path: "users", name: "users", component: UsersPage },
      { path: "profile", name: "profile", component: ProfilePage },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
  },
];
