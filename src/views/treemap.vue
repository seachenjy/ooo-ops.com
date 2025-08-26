<template>
    <div v-loading="isloading" ref="chart" class="chart-style"></div>
</template>

<script setup>
import { effect, onMounted, ref } from 'vue'
import {settingStore} from '@/store/setting'
import initTreeMap from '@/utils/treemap'
const setting = settingStore()
const chart = ref(null)
const width = ref(600);
const height = ref(600);
const isloading= ref(false)
let treemap = null
isloading.value = true
const render=()=>{
    isloading.value =true
    height.value = chart.value.offsetHeight
    width.value = chart.value.offsetWidth
    treemap = initTreeMap(chart, width, height)
    
    setting.getIndustryData().then(()=>{
        isloading.value = false
        treemap.replace(setting.treemap)
    })
    treemap.addEventListener('click', e=>{
        const industry = e.detail.name
        setting.setIndustry(industry).then(()=>{
            treemap.replace(setting.treemap)
        })
    })
}
effect(()=>{
    if(!!treemap){
        isloading.value =true
        setting.getIndustryData().then(()=>{
            isloading.value = false
            treemap.replace(setting.treemap)
        })
    }
})
onMounted(()=>{
    render()
})
</script>