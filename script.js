document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    setupEventListeners();
    loadCategories();
    openTab('categories');
});

function initializeStorage() {
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify([]));
    }
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
}

function setupEventListeners() {
    // Tab navigation
    document.getElementById('categoriesTab').addEventListener('click', () => openTab('categories'));
    document.getElementById('productsTab').addEventListener('click', () => openTab('products'));

    // Category form
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);

    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Clear all data button
    document.getElementById('clearAllData').addEventListener('click', clearAllData);
}

function openTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));

    if (tabName === 'categories') {
        document.getElementById('categoriesTab').classList.add('active');
        document.getElementById('categoriesSection').classList.add('active');
        loadCategories();
    } else {
        document.getElementById('productsTab').classList.add('active');
        document.getElementById('productsSection').classList.add('active');
        loadProducts();
        populateCategoryDropdown();
    }
}

// Category Functions
function handleCategorySubmit(e) {
    e.preventDefault();
    const categories = JSON.parse(localStorage.getItem('categories'));
    const categoryId = document.getElementById('categoryId').value;
    const categoryName = document.getElementById('categoryName').value.trim();

    if (!categoryName) return;

    if (categoryId) {
        const index = categories.findIndex(c => c.id === categoryId);
        categories[index].name = categoryName;
    } else {
        categories.push({
            id: Date.now().toString(),
            name: categoryName
        });
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    e.target.reset();
    loadCategories();
}

function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories'));
    const categoriesList = document.getElementById('categoriesList');
    
    const html = `
        <table>
            <thead>
                <tr><th>Name</th><th>Actions</th></tr>
            </thead>
            <tbody>
                ${categories.map(category => `
                    <tr>
                        <td>${category.name}</td>
                        <td class="actions">
                            <button onclick="editCategory('${category.id}')">Edit</button>
                            <button class="delete" onclick="deleteCategory('${category.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    categoriesList.innerHTML = html || '<p>No categories found</p>';
}

function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories'));
    const category = categories.find(c => c.id === id);
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
}

function deleteCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories'))
                      .filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategories();
}

// Product Functions
async function handleProductSubmit(e) {
    e.preventDefault();
    const products = JSON.parse(localStorage.getItem('products'));
    const productId = document.getElementById('productId').value;

    // Handle image upload
    let imageBase64 = '';
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        imageBase64 = await convertToBase64(imageFile);
    }

    const productData = {
        id: productId || Date.now().toString(),
        categoryId: document.getElementById('productCategory').value,
        name: document.getElementById('productName').value.trim(),
        wholesaleRate: parseFloat(document.getElementById('wholesaleRate').value),
        doorknockRate: parseFloat(document.getElementById('doorknockRate').value),
        mrp: parseFloat(document.getElementById('mrp').value),
        image: imageBase64 || document.getElementById('productImage').dataset.currentImage || ''
    };

    if (!productData.name || !productData.categoryId) return;

    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        products[index] = { ...products[index], ...productData };
    } else {
        products.push(productData);
    }

    localStorage.setItem('products', JSON.stringify(products));
    e.target.reset();
    loadProducts();
}

function convertToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products'));
    const categories = JSON.parse(localStorage.getItem('categories'));
    const productsList = document.getElementById('productsList');

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Wholesale</th>
                    <th>Doorknock</th>
                    <th>MRP</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => {
                    const category = categories.find(c => c.id === product.categoryId);
                    return `
                        <tr>
                            <td><img src="${product.image}" class="product-image" alt="${product.name}"></td>
                            <td>${product.name}</td>
                            <td>${category?.name || 'N/A'}</td>
                            <td>₹${product.wholesaleRate.toFixed(2)}</td>
                            <td>₹${product.doorknockRate.toFixed(2)}</td>
                            <td>₹${product.mrp.toFixed(2)}</td>
                            <td class="actions">
                                <button onclick="editProduct('${product.id}')">Edit</button>
                                <button class="delete" onclick="deleteProduct('${product.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    productsList.innerHTML = html || '<p>No products found</p>';
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    const product = products.find(p => p.id === id);
    
    document.getElementById('productId').value = product.id;
    document.getElementById('productCategory').value = product.categoryId;
    document.getElementById('productName').value = product.name;
    document.getElementById('wholesaleRate').value = product.wholesaleRate;
    document.getElementById('doorknockRate').value = product.doorknockRate;
    document.getElementById('mrp').value = product.mrp;
    
    // Store current image for reference
    document.getElementById('productImage').dataset.currentImage = product.image;
}

function deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem('products'))
                    .filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}

function populateCategoryDropdown() {
    const categories = JSON.parse(localStorage.getItem('categories'));
    const dropdown = document.getElementById('productCategory');
    
    dropdown.innerHTML = categories.map(c => 
        `<option value="${c.id}">${c.name}</option>`
    ).join('');
    
    if (!categories.length) {
        dropdown.innerHTML = '<option value="">No categories available</option>';
    }
}

// NEW CLEAR ALL DATA FUNCTIONALITY
function clearAllData() {
    if (confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
        localStorage.removeItem('categories');
        localStorage.removeItem('products');
        initializeStorage();
        loadCategories();
        loadProducts();
        document.getElementById('categoryForm').reset();
        document.getElementById('productForm').reset();
        alert('All data has been cleared successfully!');
    }
}
