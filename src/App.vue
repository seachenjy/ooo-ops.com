<template>
    <div class="app-container">
        <div class="header">
            <el-button @click="openTreemap"><el-icon><HomeFilled /></el-icon></el-button>
            <div class="title">{{ setting.industry }}<span> {{setting.dateRange}} </span></div>
            <el-dropdown @command="dayChangeHandler">
                <el-button>
                    周期{{ setting.day }}天<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item :command="1">1</el-dropdown-item>
                        <el-dropdown-item :command="3">3</el-dropdown-item>
                        <el-dropdown-item :command="5">5</el-dropdown-item>
                        <el-dropdown-item :command="7">7</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-tooltip content="并列趋势线" v-if="setting.industry != '所有板块'">
                <el-button @click="openMoreLineByIndustry"><el-icon><Histogram /></el-icon></el-button>
            </el-tooltip>
            <el-popover
                placement="bottom"
                ref="filter"
                title="市场过滤"
                :width="150"
                trigger="click">
                <template #reference>
                    <el-button><el-icon><Operation /></el-icon></el-button>
                </template>
                <template #default>
                    <el-checkbox-group v-model="setting.areaList">
                        <el-checkbox v-for="item in setting.areaDict" size="small" :value="item.value" >{{item.label}}</el-checkbox>
                    </el-checkbox-group>
                </template>
            </el-popover>
        </div>
        <RouterView></RouterView>
    </div>

    
</template>

<script setup>
import {settingStore} from '@/store/setting'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
const setting = settingStore()
const openMoreLineByIndustry=()=>{
    if(setting.industry == '所有板块'){
        ElMessage.error('必须先选择一个板块')
        return
    }
    router.push({path: '/line', query:{industry:setting.industry}})
}
const openTreemap=()=>{
    setting.setIndustry('所有板块')
    router.push({path: '/'})
}
const dayChangeHandler=(day)=>{
    setting.setDay(day)
    router.push({path: '/'})
}
</script>