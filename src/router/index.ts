import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AppTabs from '@/views/AppTabs.vue'
import HomeTab from '@/views/HomeTab.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/tabs/',
    component: AppTabs,
    children: [
      {
        path: '',
        redirect: 'home',
      },
      {
        path: 'home',
        component: HomeTab,
      },
      {
        path: 'add-account',
        component: () => import('@/views/AddAccount.vue'),
      },
      {
        path: 'add-account/edit/:accountId',
        component: () => import('@/views/AddAccount.vue'),
      },
      {
        path: 'settings',
        component: () => import('@/views/SettingsTab.vue'),
      },
            {
        path: 'settings/:oppenedAccordion',
        component: () => import('@/views/SettingsTab.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
