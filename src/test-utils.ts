import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import { createMemoryHistory, type Router } from "vue-router";
import { createAppRouter } from "./router";
import { useAuthStore } from "./features/auth/states/authStore";
import { useUsersStore } from "./features/users/states/usersStore";
import { useCashFlowsStore } from "./features/cashflows/states/cashFlowsStore";

export function createMockPinia(initialState: Record<string, any> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const authStore = useAuthStore(pinia);
  const usersStore = useUsersStore(pinia);
  const cashFlowsStore = useCashFlowsStore(pinia);

  Object.entries(initialState).forEach(([key, value]) => {
    [authStore, usersStore, cashFlowsStore].forEach((store) => {
      if (key in store.$state) (store.$state as any)[key] = value;
    });
  });

  return { pinia, authStore, usersStore, cashFlowsStore };
}

export interface RenderWithProvidersOptions {
  preloadedState?: Record<string, any>;
  pinia?: Pinia | null;
  router?: Router;
  props?: Record<string, any>;
  slots?: Record<string, any>;
  attachTo?: any;
  global?: Record<string, any>;
}

export function renderWithProviders(
  component: any,
  {
    preloadedState = {},
    pinia = null,
    router = createAppRouter(createMemoryHistory()),
    props = {},
    slots = {},
    attachTo = undefined,
    global = {},
  }: RenderWithProvidersOptions = {}
) {
  const provided = pinia
    ? {
        pinia,
        authStore: useAuthStore(pinia),
        usersStore: useUsersStore(pinia),
        cashFlowsStore: useCashFlowsStore(pinia),
      }
    : createMockPinia(preloadedState);

  const wrapper = mount(component, {
    props,
    slots,
    attachTo,
    global: {
      ...global,
      plugins: [provided.pinia, router],
    },
  });

  return { wrapper, router, container: wrapper.element, ...provided };
}
