let dataItems=[];
let dataCategories=[];
let currentPage=1;
const itemsPerPage=10;
let filteredItems=[];

async function fetchItems(){
  try{
    const responseItems=await fetch('http://43.205.110.71:8000/items');
    dataItems=await responseItems.json();
    const responseCategories=await fetch('http://43.205.110.71:8000/categories');
    dataCategories=await responseCategories.json();
    displayItems();
  }catch(error){
    console.error('Fetch error:',error);
  }
}

fetchItems();

function displayItems(){
  const tagsDropdown=document.querySelector('#tag');
  const categoriesDropdown=document.querySelector('#category');
  const uniqueTags=new Set();
  dataItems.forEach(item=>{
    if(item.tags)item.tags.split('|').forEach(tag => uniqueTags.add(tag));
  });
  tagsDropdown.innerHTML=`<option value="all">All Tags</option>`;
  uniqueTags.forEach(tag=>{
    tagsDropdown.innerHTML+=`<option value="${tag}">${tag}</option>`;
  });
  categoriesDropdown.innerHTML=`<option value="all">All Categories</option>`;
  dataCategories.forEach(cat=>{
    categoriesDropdown.innerHTML+=`<option value="${cat.category}">${cat.category}</option>`;
  });
  renderFilteredItems('all','all');
  tagsDropdown.addEventListener('change',()=>{
    currentPage=1;
    renderFilteredItems(categoriesDropdown.value, tagsDropdown.value);
  });
  categoriesDropdown.addEventListener('change',()=>{
    currentPage=1;
    renderFilteredItems(categoriesDropdown.value,tagsDropdown.value);
  });
  document.querySelector('#prev').addEventListener('click',()=>{
    if(currentPage>1) {
      currentPage--;
      renderPage();
    }
  });
  document.querySelector('#next').addEventListener('click',()=>{
    const totalPages=Math.ceil(filteredItems.length/itemsPerPage);
    if(currentPage<totalPages) {
      currentPage++;
      renderPage();
    }
  });
}

function renderFilteredItems(categorySelected,tagSelected){
  filteredItems=dataItems.filter(item=>{
    const matchCategory=categorySelected==='all'||item.category===categorySelected;
    const matchTag=tagSelected==='all'||(item.tags && item.tags.includes(tagSelected));
    return matchCategory && matchTag;
  });
  renderPage();
}

function renderPage(){
  const container=document.querySelector('#items');
  container.innerHTML='';
  const start=(currentPage-1)*itemsPerPage;
  const end=start+itemsPerPage;
  const pageItems=filteredItems.slice(start,end);
  pageItems.forEach(item=>{
    const div=document.createElement('div');
    div.className='item-card';
    div.innerHTML=`
      <h3>${item.name}</h3>
      <p><strong>Brand:</strong> ${item.brand}</p>
      <p><strong>Price:</strong> ₹${item.price}</p>
      <p><strong>Tags:</strong> ${item.tags}</p>
      <p><strong>Category:</strong> ${item.category}</p>
    `;
    container.appendChild(div);
  });
  updatePaginationInfo();
}

function updatePaginationInfo() {
  const totalPages=Math.ceil(filteredItems.length/itemsPerPage);
  document.getElementById('page-info').textContent=`Page ${currentPage} of ${totalPages}`;
  document.getElementById('prev').disabled=currentPage===1;
  document.getElementById('next').disabled=currentPage===totalPages;
}
