let orderData = []; // 空的陣列 主要是放抓的遠端API訂單資料

const orderList = document.querySelector(".js-orderList"); // 顯示訂單forEach的位置dom

// ---------------------------------------------------------------------------------------------
// 初始化 ( 把初始要取得列表的放在這
function init() {
  getOrderList(); // 訂單列初始列顯示
}
init();

// ---------------------------------------------------------------------------------------------
// 先取得訂單API 才能跑資料render  (訂單GET)
// Name: authorization 變數名稱要求 若不對會報錯
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      //   console.log(response.data);
      orderData = response.data.orders;
      console.log(orderData); //賦值後有抓到陣列數筆訂單

      // 資料跑forEach 組訂單字串資料顯示到頁面訂單orderList位置(訂單id等等)
      let str = "";
      orderData.forEach(function (item) {
        //  組產品字串 --- item內的products陣列跑forEach 再把裡面所有品項拉出來組字串
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });

        // 判斷訂單處理狀態
        // 用三元判斷式寫在標籤的話 ${item.paid ? '已處理' : '未處理'}
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }

        // 使用 new Date語法(13碼) 拿回傳毫秒組時間格式 做毫秒時間戳的狀態轉換
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `
        
        ${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}
        `;
        console.log(orderTime);

        // 組訂單字串
        str += `     <tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                ${productStr}
              </td>
              <td>${orderTime}</td>
              <td class="orderStatus">
                <a href="#" data-status="${item.paid}" class='js-orderStatus' data-id="${item.id}">${orderStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除" />
              </td>
            </tr>`;
        //   我不知道我點的是誰 帶上id 告訴它我想改的訂單是誰
      });
      orderList.innerHTML = str;
      renderC3_V2();
      // C3放訂單get 資料撈回來後 抓出order訂單資料一併執行做C3更新 在其他很多地方都會重新整理列表 刪除更改都能一併頁面刷新時同步修改調整C3
    });
}
// 陣列內的物件 forEach 是依序進來的每一筆陣列訂單
// 抓出誰訂的 誰的電話 (訂了哪些產品) 顯示訂單資訊
// 但每一筆訂單內選購的產品是多樣的 又會有個陣列在選購的產品並以物件形式包裹每一樣產品
// 那些產品是陣列裡面的訂單物件資料裡面的陣列 數件產品物件資料

// 我不能只抓一筆顯示 必須每筆都顯示 同樣必須在該筆訂單上依序抓出同筆訂單的數樣產品
// 那產品陣列 也必須再跑一次forEach 才可以組出我需要的資訊
// 也必須抓出產品的項目 組產品字串

// 所以跑forEach依序提出 組成他要顯示的空字串 += html格式 產品的字串
// 並放到會組建依序的訂單資訊上組成字串 累加成 html 格式 一次顯示

// ---------------------------------------------------------------------------------------------
// 訂單位置點及判斷 -- 因為針對特定 所以在刪除 和改狀態位置 都有埋ID 和增加class
orderList.addEventListener("click", function (e) {
  // 現在點擊的是要處理還是刪除判斷 從我寫的class做判斷

  e.preventDefault();

  const targetClass = e.target.getAttribute("class");
  console.log(targetClass);

  let id = e.target.getAttribute("data-id");
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    console.log("刪除");
    deleteOrderItem(id);
    return;
  }
  if (targetClass == "js-orderStatus") {
    // console.log(e.target.textContent); //未處理
    // console.log(e.target.getAttribute("data-status")); //false
    // console.log(e.target.dataset.status); //false
    // console.log(e.target.dataset.id); //訂單id

    let status = e.target.getAttribute("data-status");
    let id = e.target.getAttribute("data-id");
    switchOrderStatus(status, id);
    return;
  }
});

// 改訂單狀態 帶幾個值給他 status  還有 id ( put 帶值不一樣的 url data在第二個參數 config第三個(token之類的))
function switchOrderStatus(status, id) {
  console.log(status, id);

  let newStatus; //新變數 若點到的參數是true 新變數為false帶進去 不然就是true
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,

      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("修改訂單成功");
      getOrderList();
    });
}

// 刪除該筆訂單
function deleteOrderItem(id) {
  // console.log(id)

  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("刪除訂單成功");
      getOrderList();
    });
}

// ---------------------------------------------------------------------------------------------
// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("刪除全部訂單成功");
      getOrderList();
    });
});

// ---------------------------------------------------------------------------------------------
// 訂單撈回資料才會運行C3 才不會碰到非同步問題 (也就是顯示空的 因為API都還沒回傳抓取到的)
// get到資料 有寫運行  要做類別營收 (這個類別 賣了幾個品項 總共多少錢  A品項的金額加總  而不是直接拿總數)
// function renderC3() {
//   console.log(orderData); // 有取到訂單

//   // 先做篩選資料 物件資料蒐集 抓出屬性之類(目前需要的是product陣列資料 內包很多個物件 要的是category的資訊)
//   let total = {};
//   orderData.forEach(function (item) {
//     item.products.forEach(function (productItem) {
//       if (total[productItem.category] == undefined) {
//         total[productItem.category] = productItem.price * productItem.quantity;
//       } else {
//         total[productItem.category] += productItem.price * productItem.quantity;
//       }
//     });
//   });
//   console.log(total); // {XX:12000, XX:8000}

//   // 接著做陣列資料關聯
//   let categoryAry = Object.keys(total);
//   console.log(categoryAry); // ['收納','床架']

//   // 組出要的陣列包陣列(C3要的格式資料)-陣列推進陣列
//   let newData = [
//     // ['XXX',12000],['XX',9000]  類似這樣 由下面組好 push進來
//   ];

//   categoryAry.forEach(function (item) {
//     let ary = [];
//     ary.push(item);
//     ary.push(total[item]);

//     newData.push(ary);
//   });
//   console.log(newData);

//   // C3.js
//   let chart = c3.generate({
//     bindto: "#chart", // HTML 元素綁定
//     data: {
//       type: "pie",
//       columns: newData,
//       //   colors: {
//       //     "Louvre 雙人床架": "#DACBFF",
//       //     "Antony 雙人床架": "#9D7FEA",
//       //     "Anty 雙人床架": "#5434A7",
//       //     其他: "#301E5F",
//       //   },
//     },
//   });
// }

// 設計前三名與其他(第四名後的加總)
function renderC3_V2() {
  console.log(orderData); // 有取到訂單

  // 先做篩選資料 物件資料蒐集 抓出屬性之類(目前需要的是product陣列資料 內包很多個物件 要的是category的資訊)
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.title] == undefined) {
        total[productItem.title] = productItem.price * productItem.quantity;
      } else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(total); // {XX:12000, XX:8000}

  // 接著做陣列資料關聯
  let titleAry = Object.keys(total);
  console.log(titleAry); // ['產品名','產品名','產品名','產品名','產品名','產品名']

  // 組出要的陣列包陣列(C3要的格式資料)-陣列推進陣列
  let newData = [
    // ['XXX',12000],['XX',9000]  類似這樣 由下面組好 push進來
  ];

  titleAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);

    newData.push(ary);
  });
  console.log(newData);

  // 做排序 希望第一筆陣列 由多到少 降冪排列
  newData.sort(function (a, b) {
    // 這裡的參數a,b 跟一般數字比較不一樣
    // 如果寫 b-a , 參數a,b 屬於item依序帶入比較大小 但帶進來目前是兩個陣列做比較 陣列不能比較
    // 因此取 該陣列的[1]數字 相互比較
    return b[1] - a[1]; // 這時的newData陣列應該是被排序後的 高到低
  });

  // 比較完後 用 如果比數超過4筆以上 , 除 1,2,3 外 第4之後統整為其他
  if (newData.length > 3) {
    let otherTotal = 0;

    newData.forEach(function (item, index) {
      // 因為排序過高到低的陣列內了 index順位2 (以012計算index排序位  意思是 如果筆數超過第3筆)
      if (index > 2) {
        otherTotal += newData[index][1]; //這時跑的會是index3 就是第四筆 把該陣列內第2個金額數累加
      }
    });

    newData.splice(3, newData.length - 1); // 陣列內的原本值要拿掉 第4筆資訊起 刪除後續所有
    newData.push(["其他", otherTotal]); // 將圖表陣列內 push增加一個其他 並賦予值
    console.log(`---------------------`);
    console.log(newData);
  }

  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      //   colors: {
      //     "Louvre 雙人床架": "#DACBFF",
      //     "Antony 雙人床架": "#9D7FEA",
      //     "Anty 雙人床架": "#5434A7",
      //     其他: "#301E5F",
      //   },
    },
  });
}
