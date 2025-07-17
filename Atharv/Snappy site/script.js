let dataItems = [];
let dataCategories = [];

async function fetchItems() {
  try { 
    const responseItems = await fetch('http://43.205.110.71:8000/items');
    if (!responseItems.ok) throw new Error('Items fetch failed');
    dataItems = await responseItems.json();
    const responseCategories = await fetch('http://43.205.110.71:8000/categories');
    if (!responseCategories.ok) throw new Error('Categories fetch failed');
    dataCategories = await responseCategories.json();
    displayItems();
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchItems();

function displayItems() {
  const itemsContainer = document.querySelector('#items');
  const tagsDropdown = document.querySelector('#tag');
  const categoriesDropdown = document.querySelector('#category');
  const uniqueTags = new Set();
  dataItems.forEach(item=>{
    if (item.tags) {
      item.tags.split('|').forEach(tag => uniqueTags.add(tag));
    }
  });
  tagsDropdown.innerHTML = `<option value="all">All Tags</option>`;
  uniqueTags.forEach(tag=>{
    tagsDropdown.innerHTML += `<option value="${tag}">${tag}</option>`;
  });
  categoriesDropdown.innerHTML = `<option value="all">All Categories</option>`;
  dataCategories.forEach(cat => {
    categoriesDropdown.innerHTML += `<option value="${cat.category}">${cat.category}</option>`;
  });
  renderFilteredItems('all', 'all');
  tagsDropdown.addEventListener('change',()=>{
    renderFilteredItems(categoriesDropdown.value, tagsDropdown.value);
  });
  categoriesDropdown.addEventListener('change',()=>{
    renderFilteredItems(categoriesDropdown.value, tagsDropdown.value);
  });
}

function renderFilteredItems(categorySelected, tagSelected) {
  const container = document.querySelector('#items');
  container.innerHTML = '';
  dataItems.forEach(item => {
    const matchCategory = categorySelected === 'all' || item.category === categorySelected;
    const matchTag = tagSelected === 'all' || (item.tags && item.tags.includes(tagSelected));
    if (matchCategory && matchTag) {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p><strong>Brand:</strong> ${item.brand || 'N/A'}</p>
        <p><strong>Price:</strong> ₹${item.price || 'N/A'}</p>
        <p><strong>Tags:</strong> ${item.tags || 'None'}</p>
        <p><strong>Category:</strong> ${item.category}</p>
      `;
      container.appendChild(div);
    }
  });
}
