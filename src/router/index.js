import { createRouter, createWebHistory } from 'vue-router'
import treemap from '@/views/treemap.vue'
import line from '@/views/line.vue'
import test from '@/views/test.vue'
const router = createRouter({
    history: createWebHistory(),
    routes:[
        
        {
            path: '/',
            // component: treemap
            component: test
        },
        {
            path: '/line',
            component: line
        }
    ]
})

export default router