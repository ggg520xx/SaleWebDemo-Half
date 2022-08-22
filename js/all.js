//產品 DOM
const productList = document.querySelector(".productWrap"); // 顯示產品的位置dom
const productSelect = document.querySelector(".productSelect"); // 篩選按鈕dom

const cartList = document.querySelector(".shoppingCart-tableList"); //顯示購物車的位置dom

const deleteAllCartBtn = document.querySelector(".discardAllBtn"); // 購物車刪除全部品項dom
const cartTotal = document.querySelector(".js-total"); // 購物車總金額

let productData = []; // 放產品陣列
let cartData = [];

// ---------------------------------------------------------------------------------------------
// 初始化 ( 把初始要取得列表的放在這
function init() {
  getProductList(); // 產品列初始列顯示
  getCartList(); // 購物車初始列顯示
}
init();

// ---------------------------------------------------------------------------------------------
// 取得API產品列表 資料初始化 網路一載入 產品和購物車都要初始化
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      //   console.log(response);
      //   console.log(response.data);
      productData = response.data.products; // 找到我要的資料 把它放進我的陣列

      // ------這串可以抓出去包成函式renderProductList------
      let str = ""; // 就可以來組字串了 str為空字串
      // 要 += 之前先拿組好的陣列跑forEach抓每一筆的item對應;

      // id 加入購物車按鈕會使用到
      // str跑 產品標題 和 加入購物車鈕會 綁data - id資訊 id是來自forEach後的item內抓的
      // 每項產品有套上取值的id   我按到才可以取出id 把這筆資料加到購物車

      productData.forEach(function (item) {
        // str += `<li>${item.title}</li> <input value="加入購物車" data-id="${item.id}" type="button" class="js-addCart">`;

        str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="" />
                <a href="#" class="js-addCart" data-id="${
                  item.id
                }">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${toThousands(
                  item.origin_price
                )}</del>
                <p class="nowPrice">NT$${toThousands(item.price)}</p>
              </li>`;
        // 按鈕寫calss 是監聽範圍的判斷 我想點按鈕而不是li文字
        // class取名原因為直觀只操作JS 不帶CSS樣式 做明顯區隔
      });

      productList.innerHTML = str;
      // -------------------------------
    });
}

// ---------------------------------------------------------------------------------------------
// 做change篩選按鈕的監聽 html的分類 綁一顆 productSelect的dom 點它切換觸發change事件 換其他選項就執行
productSelect.addEventListener("change", function (e) {
  // console.log(e.target.value)
  const category = e.target.value;

  // 跑全部
  if (category == "全部") {
    // ------這串可以抓出去包成函式renderProductList----
    //全部的話 組一個一樣的內容
    let str = "";
    productData.forEach(function (item) {
      str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="" />
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
  </li>`;
    });
    productList.innerHTML = str;
    // -----------------------------
    return; // 選定這個跑這邊就要終止 不再往下跑了
  }

  // 跑其他篩選 選的不是全部 就不會走上面的if
  let str = "";
  productData.forEach(function (item) {
    //撈出那幾筆跑forEach
    if (item.category == category) {
      //如果跑的陣列內那幾筆 item.category有等同我點到target的category才組字串
      str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="" />
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
  </li>`;
    }
  });
  productList.innerHTML = str;
});

// ---------------------------------------------------------------------------------------------
// 購物車列表API (看一下原html 格式 只針對body去更新內容資料)
function getCartList() {
  axios
    .get(
      ` https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      cartData = response.data.carts;

      // 抓購物車列表刷新目前總金額
      console.log(`目前總金額${response.data.finalTotal}`);
      cartTotal.textContent = toThousands(response.data.finalTotal);

      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
                    <td>
                        <div class="cardItem-title">
                        <img src="${item.product.images}" alt="" />
                        <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${toThousands(item.product.price)}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${toThousands(
                      item.product.price * item.quantity
                    )}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id="${
                          item.id
                        }" data-title="${item.product.title}">
                        clear
                        </a>
                    </td>
                </tr>`;
      });
      cartList.innerHTML = str;
    });
}

// ---------------------------------------------------------------------------------------------
// 加入購物車的按鈕+API新增 (該範圍監聽 點擊的事件) - 有問為什麼要用範圍監聽而不單個監聽按鈕
productList.addEventListener("click", function (e) {
  e.preventDefault();

  let addCartClass = e.target.getAttribute("class");
  //   console.log(e.target.getAttribute("class"));

  if (addCartClass !== "js-addCart") {
    // 點擊的不是加入按鈕的話
    console.log("非加入按鈕,retun終止");
    return;
  }

  //   console.log(e.target.dataset.id);
  //   console.log(e.target.getAttribute("data-id"));
  // 在這個加入按鈕的標籤 從陣列組字串那邊留個自己data-id帶入item的產品id 才能得知點到加入到購物列的產品
  let addCartProductId = e.target.dataset.id; // 點到的id 加入到購物列表的行為
  console.log(addCartProductId);

  let numCheck = 1; // 數量預設及變化(已有的產品就變成變數塞入新值給購物列表內 沒有的產品則為預設1給新產品post)
  cartData.forEach(function (item) {
    // 拿點擊的id和目前購物車列表內的id比對 購物車有一樣的品項時候  抓出資料數量+1 改變數量
    if (item.product.id === addCartProductId) {
      numCheck = item.quantity += 1;
      // 點擊加入購物車先跑forEach 列表內有沒有一樣id 抓出目前數量有幾筆(例如目前有5) 然後post目前的數量+1 post 6筆出去
      // 沒有一樣id 就是沒這個資料 就post新增1筆
    }
  });

  console.log(`該品數量${numCheck}`);

  // 我要新增選到的加入購物車 發送加入了哪些產品id  並看是不是有了該筆 請他更新數量1 或是+1
  // 點到的產品id依格式 post  數量則如果點到的id 和目前已有的陣列內id 相同 則抓出來+1 post回去增加計算後數量 沒有該id則為1 新增post該產品
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: addCartProductId,
          quantity: numCheck,
        },
      }
    )
    .then(function (response) {
      alert("加入成功");
      getCartList(); // 新增完畢後 刷新購物列表頁面
    });
});

// ---------------------------------------------------------------------------------------------
// 做單一刪除 因為要針對品項做刪除 因此渲染頁面的str要埋id ( 購物車的部分並非產品的
cartList.addEventListener("click", function (e) {
  // console.log(e.target.dataset.id); // 取出id 點其他地方會是undefined 也沒問題的做法
  e.preventDefault(); // 防止彈到上面
  const cartId = e.target.getAttribute("data-id");
  // console.log(cartId); // 也是取出id 點其他地方會是null

  const cartTitle = e.target.getAttribute("data-title"); //試抓出組字串的自寫 data-title 並在刪除處引用變數

  // ----- 刪除判斷  不希望點到奇怪的東西 要排除 刪除特定id -----
  if (cartId == null) {
    console.log("不是點到刪除唷");
    return; // 點到非刪除鈕的話 null 就不往下跑
  }
  axios // 往下執行符合條件的結果 按刪除
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then(function (response) {
      alert(`刪除購物車內 < ${cartTitle} > 品項成功`);
      getCartList(); // 重新顯示購物車列表資訊
    });
});

// ---------------------------------------------------------------------------------------------
// 購物車內加入的品項一次全部刪除  (  針對刪除全部的按鈕綁事件監聽
deleteAllCartBtn.addEventListener("click", function (e) {
  e.preventDefault(); // 防止彈到上面
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      alert("刪除購物車內全部品項"); // axios刪除全部購物車後 實際已刪除遠端資料庫 但頁面不變的話 要回撈全部購物車資料
      getCartList(); // 遠端刪除後 會再次get購物車是否真的有無資料 保持頁面的最新狀態
    })
    .catch(function (response) {
      // 再次點擊的錯誤判斷要寫
      //catch 為 axios參照promise的語法
      alert("購物車為空,請加入購物品項");
      console.log(response);
    });
});

// ---------------------------------------------------------------------------------------------
// 資料都對的話 才送出預訂資料 欄位的值有沒有寫正確 ( 不會用到form傳送 用js傳送不用用到form表單 )

// 送出按鈕綁監聽 綁完做後續 -------- (送出訂單的判斷及送出)
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault(); // 取消默認行為 因為要透過js做傳送
  // 要滿足2條件才送出訂單請求 1.詳細填滿訂單資訊  2.購物車有品項才可  先判斷是不是真的有那些項目
  if (cartData.length == 0) {
    // 購物車陣列沒產品 終止程式 0筆不能送 先從前台幫後端擋住莫名的訂單請求以免出問題
    console.log("請加入購物車品項");
    alert("請加入購物車品項");
    return; // 不讓它繼續往下執行
  }

  // 判斷有沒有value值並抓取填寫的
  // const customerName = document.querySelector(".customerName");
  const customerName = document.getElementById("customerName").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const customerAddress = document.getElementById("customerAddress").value;
  const customerTradeWay = document.getElementById("tradeWay").value;

  // 防錯判斷(或) 其中一個欄位為空就執行提醒
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    customerTradeWay == ""
  ) {
    alert("請填寫完整資訊");
    return;
  }
  // 有購物車資料 資訊也有填寫完整才能通過 (訂單post的客戶表單資訊)

  // 帶入data的格式進去 使用它的符合傳送格式
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: customerTradeWay,
          },
        },
      }
    )
    .then(function (response) {
      console.log("傳送成功");
      alert("訂單建立成功");

      // 送出完畢改成空字串
      document.getElementById("customerName").value = "";
      document.getElementById("customerPhone").value = "";
      document.getElementById("customerEmail").value = "";
      document.getElementById("customerAddress").value = "";
      document.getElementById("tradeWay").value = "ATM";

      getCartList(); // 購物車列表刷新 正常是已無購物項目了
    });
});

// ---------------------------------------------------------------------------------------------
