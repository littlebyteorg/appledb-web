const deviceChartStr = themeLocale.chart.deviceChart;
function getDeviceArr(typeArr) {
  var deviceArr = [];
  for (const i in typeArr) {
    deviceArr.push([]);
    for (const d in deviceGroups) {
      if (deviceGroups[d].type == 'iPad') {
        if (deviceGroups[d].subtype == typeArr[i]) {
          deviceArr[i].push(deviceGroups[d]);
        }
      } else if (deviceGroups[d].type == typeArr[i]) {
        deviceArr[i].push(deviceGroups[d]);
      }
    }
    deviceArr[i].reverse()
  }
  
  return deviceArr;
}

function getTableCount(typeArr, deviceArr, tableWidth) {
  var tableCount = [];
  for (const i in typeArr) {
    tableCount.push(parseInt(deviceArr[i].length / tableWidth) + !!(deviceArr[i].length % tableWidth))
  }
  return tableCount;
}

function getDevice(device) {
  var ret = [];
  for (var d in deviceList) {
    if (deviceList[d] == device) {
      ret.push(d);
    }
  }
  return ret;
}

function getHtml(typeArr, path, toc) {
  var html = '';
  
  if (typeArr.length > 1 && toc) html += '[[toc]]\n';
  if (typeArr.includes('iPad') && !(typeArr.includes('mini') && typeArr.includes('Pro') && typeArr.includes('Air'))) typeArr = typeArr.concat(['mini', 'Pro', 'Air'])
  
  var deviceArr = getDeviceArr(typeArr);
  var tableWidth = 3
  if (deviceArr[0].length < 3) tableWidth = deviceArr[0].length
  var tableCount = getTableCount(typeArr, deviceArr, tableWidth);
  var colWidth = parseInt(100 / tableWidth)
  
  for (const i in deviceArr) {
    if (deviceArr[i].length < 1) continue;
    if (typeArr.length > 1) html += '## ' + deviceChartStr.devices[typeArr[i]] + '\n';
    
    deviceArr[i].sort(function(a,b) { return a.order - b.order })
    deviceArr[i].reverse()
    
    for (var j = 0; j < tableCount[i]; j++) {
      html += `<table><colgroup><col width="${colWidth}%"><col width="${colWidth}%"><col width="${colWidth}%"></colgroup><thead><tr>`
      for (var k = 0; k < tableWidth; k++) {
        if (deviceArr[i][j*tableWidth+k]) html += '<th>' + deviceArr[i][j*tableWidth+k].name.replace('generation', 'gen') + '</th>';
        else html += '<th></th>';
      }
      html += '</tr></thead><tbody><tr>'
      for (var k = 0; k < tableWidth; k++) {
        const d = deviceArr[i][j*tableWidth+k];
        const p = path || devicePath;
        if (d) {
          html += '<td><router-link to="' + p + d.name.replace(/ /g, '-') + '"><img src="https://ipsw.me/assets/devices/' + d.devices[0] + '.png" alt="' + d.name + '" loading="lazy" style="width: 50%;"></router-link></td>';
        }
        else html += '<td></td>';
      }
      html += "</tr></tbody></table>\n\n"
    }
  }
  
  return html + '<p>AppleDB is not affiliated with Apple Inc.</p>';
}

module.exports = function(typeArr, path, toc) {
  return getHtml(typeArr, path, toc);
}