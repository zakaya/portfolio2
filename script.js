
const defaultProducts = [
    {id:1,name:"Fresh Apples",category:"Fruits",price:250,unit:"1 kg",image:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500",description:"Fresh red apples"},
    {id:2,name:"Fresh Bananas",category:"Fruits",price:150,unit:"1 dozen",image:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",description:"Sweet bananas"},
    {id:3,name:"Fresh Milk",category:"Dairy",price:220,unit:"1 litre",image:"https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",description:"Fresh dairy milk"},
    {id:4,name:"Orange Juice",category:"Beverages",price:180,unit:"1 litre",image:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",description:"Fresh orange juice"},
    {id:5,name:"Potato Chips",category:"Snacks",price:100,unit:"Pack",image:"https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500",description:"Crunchy chips"},
    {id:6,name:"Cooking Oil",category:"Grocery",price:550,unit:"1 litre",image:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",description:"Quality cooking oil"},
    {id:7,name:"Tomatoes",category:"Vegetables",price:120,unit:"1 kg",image:"https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500",description:"Fresh tomatoes"},
    {id:8,name:"Eggs",category:"Dairy",price:350,unit:"1 dozen",image:"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500",description:"Farm fresh eggs"},
    {id:9,name:"Washing Powder",category:"Household",price:280,unit:"1 kg",image:"https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500",description:"Cleaning detergent"},
    {id:10,name:"Biscuits",category:"Snacks",price:80,unit:"Pack",image:"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500",description:"Tea time biscuits"}
];

function getData(key,fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

if(!localStorage.getItem("smProducts")) {
    localStorage.setItem("smProducts",JSON.stringify(defaultProducts));
}

let products = getData("smProducts",defaultProducts);
let cart = getData("smCart",[]);
let activeCategory = "All";

const categoryList = [
    ["All","🛍️"],["Grocery","🌾"],["Fruits","🍎"],
    ["Vegetables","🥦"],["Beverages","🥤"],
    ["Dairy","🥛"],["Snacks","🍪"],["Household","🧹"]
];

function safe(value) {
    return String(value).replace(/[&<>"']/g,c=>({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
}

function renderCategories() {
    document.getElementById("categoryGrid").innerHTML =
    categoryList.map(([name,emoji])=>`
        <div class="category-card ${activeCategory===name?"active":""}"
             onclick="filterCategory('${name}')">
            <div>${emoji}</div><h3>${name}</h3>
        </div>
    `).join("");
}

function filterCategory(category) {
    activeCategory=category;
    renderCategories();
    renderProducts();
}

function renderProducts() {
    products=getData("smProducts",defaultProducts);
    const search=document.getElementById("search").value.toLowerCase();
    const sort=document.getElementById("sort").value;

    let list=products.filter(p=>
        p.available!==false &&
        (activeCategory==="All"||p.category===activeCategory) &&
        (p.name.toLowerCase().includes(search)||
         p.category.toLowerCase().includes(search))
    );

    if(sort==="low") list.sort((a,b)=>a.price-b.price);
    if(sort==="high") list.sort((a,b)=>b.price-a.price);
    if(sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));

    document.getElementById("productGrid").innerHTML=list.length?
    list.map(p=>`
        <div class="product-card">
            <img src="${safe(p.image)}" alt="${safe(p.name)}"
                 onerror="this.src='https://placehold.co/500x350?text=Product'">
            <div class="product-info">
                <small>${safe(p.category)}</small>
                <h3>${safe(p.name)}</h3>
                <p>${safe(p.description)}</p>
                <div class="product-bottom">
                    <span class="price">Rs. ${Number(p.price)} / ${safe(p.unit||"item")}</span>
                    <button class="add-btn" onclick="addToCart(${Number(p.id)})">+ Add</button>
                </div>
            </div>
        </div>
    `).join(""):'<p>No products found.</p>';
}

function saveCart() {
    localStorage.setItem("smCart",JSON.stringify(cart));
}

function addToCart(id) {
    const product=products.find(p=>p.id===id);
    if(!product)return;

    const item=cart.find(p=>p.id===id);
    if(item)item.quantity++;
    else cart.push({...product,quantity:1});

    saveCart();
    renderCart();
    toast("Product added to cart!");
}

function changeQty(id,amount) {
    const item=cart.find(p=>p.id===id);
    if(!item)return;
    item.quantity+=amount;
    if(item.quantity<=0)cart=cart.filter(p=>p.id!==id);
    saveCart();
    renderCart();
}

function removeItem(id) {
    cart=cart.filter(p=>p.id!==id);
    saveCart();
    renderCart();
}

function renderCart() {
    const box=document.getElementById("cartItems");

    box.innerHTML=cart.length?cart.map(p=>`
        <div class="cart-item">
            <img src="${safe(p.image)}" alt="">
            <div class="cart-item-info">
                <h4>${safe(p.name)}</h4>
                <p>Rs. ${p.price*p.quantity}</p>
                <div class="qty">
                    <button onclick="changeQty(${p.id},-1)">−</button>
                    ${p.quantity}
                    <button onclick="changeQty(${p.id},1)">+</button>
                </div>
            </div>
            <button onclick="removeItem(${p.id})">✕</button>
        </div>
    `).join(""):'<p>Your cart is empty.</p>';

    const count=cart.reduce((s,p)=>s+p.quantity,0);
    const subtotal=cart.reduce((s,p)=>s+p.price*p.quantity,0);
    const delivery=subtotal===0||subtotal>=3000?0:150;

    document.getElementById("cartCount").textContent=count;
    document.getElementById("subtotal").textContent=subtotal;
    document.getElementById("delivery").textContent=delivery;
    document.getElementById("total").textContent=subtotal+delivery;
}

function toggleCart() {
    document.getElementById("cartPanel").classList.toggle("show");
    document.getElementById("overlay").classList.toggle("show");
}

function checkout() {
    if(!cart.length){toast("Your cart is empty!");return;}
    document.getElementById("checkoutModal").classList.add("show");
}

function closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("show");
}

document.getElementById("checkoutForm").addEventListener("submit",e=>{
    e.preventDefault();

    const subtotal=cart.reduce((s,p)=>s+p.price*p.quantity,0);
    const order={
        id:Date.now(),
        customer:document.getElementById("customerName").value.trim(),
        phone:document.getElementById("customerPhone").value.trim(),
        address:document.getElementById("customerAddress").value.trim(),
        payment:document.getElementById("paymentMethod").value,
        items:cart.map(p=>({
            name:p.name,price:p.price,quantity:p.quantity
        })),
        total:subtotal+(subtotal>=3000?0:150),
        status:"Pending",
        date:new Date().toLocaleString()
    };

    if(!order.customer||!order.phone||!order.address||!order.payment)return;

    const orders=getData("smOrders",[]);
    orders.unshift(order);
    localStorage.setItem("smOrders",JSON.stringify(orders));

    cart=[];
    saveCart();
    renderCart();
    closeCheckout();
    toggleCart();
    e.target.reset();
    toast("Order placed successfully! #"+order.id);
});

function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem("smDark",document.body.classList.contains("dark"));
}

if(localStorage.getItem("smDark")==="true")document.body.classList.add("dark");

function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("open");
}

function toast(message) {
    const el=document.getElementById("toast");
    el.textContent=message;
    el.classList.add("show");
    clearTimeout(window.toastTimeout);
    window.toastTimeout=setTimeout(()=>el.classList.remove("show"),2500);
}

document.getElementById("search").addEventListener("input",renderProducts);
document.getElementById("sort").addEventListener("change",renderProducts);

renderCategories();
renderProducts();
renderCart();
