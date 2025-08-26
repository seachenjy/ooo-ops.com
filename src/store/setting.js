import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import {treemap,stocks} from '@/api/api'
export const settingStore = defineStore('setting', {
    state: () => ({
        startDate: '',
        endDate: '',
        industry: "所有板块",
        areaList:useStorage('areaList',[ '60', '00', '688', '300', '301', '920', 'st' ]),
        areaDict: [
            {value:"60" , label:"沪主板"},
            {value:"00" , label:"深主板"},
            {value:"688", label:"科创板"},
            {value:"300", label:"创业板"},
            {value:"301", label:"注册制"},
            {value:"920", label:"北交所"},
            {value:"st" , label:"ST股"},
        ],
        day:useStorage('filterDay',1),
        industryData:[],
        allCodes:[],
        lineData:[]
    }),
    getters: {
        dateRange: (state)=>{
            const arr = []
            if(state.startDate!=''){
                arr.push(state.startDate)
            }
            if(state.endDate!=''){
                arr.push(state.endDate)
            }
            return arr.join('-')
        },
        treemap: (state)=>{
            if(state.industry == '所有板块'){
                return state.industryData
            }
            const _data = {}
            state.allCodes.filter(item=>item.industry == state.industry).map(item=>{
                if(!filterItem(item, state.areaList)){
                    return
                }
                const {amount,pct_chg,name} = item
                if(!_data[name]){
                    _data[name] = {amount,pct_chg,name}
                }else{
                    _data[name].amount += amount
                    _data[name].pct_chg += pct_chg
                }
            })
            return Object.values(_data)
        }
    },
    actions: {
        setIndustry(industry){
            this.industry = industry
            return Promise.resolve()
        },
        setDay(day) {
            this.day = day
        },
        setArea(area){
            this.areaList = area
        },
        getIndustryData(){
            return treemap({
                day:this.day
            }).then(res=>{
                const data = res.data
                this.allCodes = res.data
                const __industry = {}
                if(this.areaList.length <= 0){
                    return
                }
                data.map(item=>{
                    const {amount,pct_chg,industry} = item
                    if(!filterItem(item, this.areaList)){
                        return
                    }
                    if(!__industry[industry]){
                        __industry[industry] = {amount,pct_chg}
                        return
                    }
                    __industry[item.industry].amount += amount
                    __industry[item.industry].pct_chg += pct_chg
                })
                const __industry_arr = []
                Object.keys(__industry).map(item=>{
                    __industry_arr.push({
                        name: item,
                        ...__industry[item]
                    })
                })
                this.industryData = __industry_arr
            })
        },
        getLineData(){
            return stocks({
                day:70,
                industry: this.industry
            }).then(res=>{
                const data = []
                res.data.map(item=>{
                    if(!filterItem(item,this.areaList)){
                        return
                    }
                    data.push(item)
                })
                this.lineData = data
            })
        }
    },
})

function filterItem(item, filters){
    const {ts_code,name} = item
    if(!name | !ts_code){
        return false
    }
    if(!!name && name.indexOf('ST') >= 0){
        if(!filters.includes('st')){
            return false
        }
    }
    let out = true
    filters.map(item=>{
        if(ts_code.indexOf(item) == 0){
            out = false
        }
    })
    return !out
}