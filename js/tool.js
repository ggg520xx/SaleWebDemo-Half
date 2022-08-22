// 最後工具類JS (數字轉千分位設計)  - 數字傳進去 他回傳轉型的結果

function toThousands(x) {
  let parts = x.toString().split("."); //轉為字串   然後.split("."); parts值會變為陣列內字串
  // console.log(parts);

  // split先分離小數點 整數用正則處理完千分位 再join加回來
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

//---------------------------------------------------------------------------------------------

