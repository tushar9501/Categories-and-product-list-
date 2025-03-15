// Initialize Supabase
const SUPABASE_URL = 'https://pbdblhxxqnfuwyrqrest.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZGJsaHh4cW5mdXd5cnFyZXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTA1MTEsImV4cCI6MjA1NzYyNjUxMX0.c4HnVEnECphLS9aH2QKqT_o4Dqr9HGc-WK7pDKI2Dww';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadCategories();
    openTab('categories');
});

function setupEventListeners() {
    // Tab navigation
    document.getElementById('categoriesTab').addEventListener('click', () => openTab('categories'));
    document.getElementById('productsTab').addEventListener('click', () => openTab('products'));

    // Forms
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
}

// Category Functions
async function handleCategorySubmit(e) {
    e.preventDefault();
    const categoryId = document.getElementById('categoryId').value;
    const categoryName = document.getElementById('categoryName').value.trim();

    if (!categoryName) return;

    try {
        if (categoryId) {
            // Update existing category
            const { error } = await supabase
                .from('categories')
                .update({ name: categoryName })
                .eq('id', categoryId);
        } else {
            // Add new category
            const { error } = await supabase
                .from('categories')
                .insert([{ name: categoryName }]);
        }
        
        loadCategories();
        e.target.reset();
    } catch (error) {
        console.error('Error saving category:', error);
    }
}

async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false });

        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = `
            <table>
                <thead><tr><th>Name</th><th>Actions</th></tr></thead>
                <tbody>
                    ${data.map(category => `
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
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
    }
}

// Product Functions
async function handleProductSubmit(e) {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const imageFile = document.getElementById('productImage').files[0];

    try {
        let imageUrl = document.getElementById('productImage').dataset.currentImage || '';
        
        // Upload new image if selected
        if (imageFile) {
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(`products/${Date.now()}-${imageFile.name}`, imageFile);
            
            if (data) {
                imageUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
            }
        }

        const productData = {
            name: document.getElementById('productName').value.trim(),
            category_id: document.getElementById('productCategory').value,
            wholesale_rate: parseFloat(document.getElementById('wholesaleRate').value),
            doorknock_rate: parseFloat(document.getElementById('doorknockRate').value),
            mrp: parseFloat(document.getElementById('mrp').value),
            image_url: imageUrl
        };

        if (productId) {
            // Update existing product
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId);
        } else {
            // Add new product
            const { error } = await supabase
                .from('products')
                .insert([productData]);
        }

        loadProducts();
        e.target.reset();
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories (name)
            `)
            .order('created_at', { ascending: false });

        const productsList = document.getElementById('productsList');
        productsList.innerHTML = `
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
                    ${data.map(product => `
                        <tr>
                            <td><img src="${product.image_url}" class="product-image" alt="${product.name}"></td>
                            <td>${product.name}</td>
                            <td>${product.categories?.name || 'N/A'}</td>
                            <td>₹${product.wholesale_rate?.toFixed(2) || '0.00'}</td>
                            <td>₹${product.doorknock_rate?.toFixed(2) || '0.00'}</td>
                            <td>₹${product.mrp?.toFixed(2) || '0.00'}</td>
                            <td class="actions">
                                <button onclick="editProduct('${product.id}')">Edit</button>
                                <button class="delete" onclick="deleteProduct('${product.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Helper Functions
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

async function populateCategoryDropdown() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name', { ascending: true });

        const dropdown = document.getElementById('productCategory');
        dropdown.innerHTML = data.map(c => 
            `<option value="${c.id}">${c.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Edit Functions
function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories'));
    const category = categories.find(c => c.id === id);
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products'));
    const product = products.find(p => p.id === id);
    
    document.getElementById('productId').value = product.id;
    document.getElementById('productCategory').value = product.categoryId;
    document.getElementById('productName').value = product.name;
    document.getElementById('wholesaleRate').value = product.wholesale_rate;
    document.getElementById('doorknockRate').value = product.doorknock_rate;
    document.getElementById('mrp').value = product.mrp;
    document.getElementById('productImage').dataset.currentImage = product.image_url;
}
