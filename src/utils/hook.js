import * as echarts from 'echarts';

function convert(source, target, basePath) {
    for (let key in source) {
        let path = basePath ? basePath + '.' + key : key;
        if (!key.match(/^\$/)) {
        target.children = target.children || [];
        const child = {
            name: path,
            colorIndex: 0
        };
        target.children.push(child);
            convert(source[key], child, path);
        }
    }
    if (!target.children) {
        target.value = source.$count || 1;
    } else {
        target.children.push({
            name: basePath,
            value: source.$count,
            colorIndex: 0
        });
    }
}
const data = {
    children: []
};
  
export function initEcharts(ref){
    const myChart = echarts.init(ref.value);
    myChart.showLoading();

    fetch('/chart.json?t=' + new Date().getTime()).then((resp) => resp.json()).then((rawData) => {
        myChart.hideLoading();
        convert(rawData, data, '');
        console.log(data);
        myChart.setOption({
            tooltip: {},
            visualMap: {
                min: 0,
                max: 100,
                calculable: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                inRange: {
                    color: ['#d94e5d', '#eac736', '#50a3ba']
                }
            },
            series: [
                {
                name: 'option',
                type: 'treemap',
                visibleMin: 300,
                data: data.children,
                leafDepth: 2,
                levels: [
                        { depth: 0, itemStyle: { color: '#ff6b6b' } }, // 顶层-红色
                        { depth: 1, itemStyle: { color: '#4ecdc4' } }, // 第二层-青色
                        { depth: 2, colorMapping: 'byValue' }          // 第三层按数值映射
                    ],
                }
            ]
        });
    })
}