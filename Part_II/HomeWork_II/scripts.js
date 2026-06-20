const savedProducts = localStorage.getItem('filled_basket');

let products = savedProducts ? JSON.parse(savedProducts) : [
    { name: "Tomato", quantity: 2, isBought: true },
    { name: "Salmon Steak", quantity: 2, isBought: false },
    { name: "Eidar Cheese", quantity: 1, isBought: false }
];

const form = document.querySelector('form');
const input = document.querySelector('form input');
const list = document.querySelector('ul');

const remained = document.querySelectorAll('.tags-container')[0];
const bought = document.querySelectorAll('.tags-container')[1];

function render() {

    list.innerHTML = "";
    remained.innerHTML = "";
    bought.innerHTML = "";

    products.forEach(function (product, index) {

        const newLi = document.createElement('li');

        if (product.isBought) {
            newLi.classList.add('purchased-item');

            newLi.innerHTML = `
                <span class="item-name">${product.name}</span>
                <div class="center-controls">
                    <span class="quantity-box">${product.quantity}</span>
                </div>
                <div class="right-controls">
                    <button class="disabled-state" data-tooltip="Bought already" data-index="${index}">Bought</button>
                </div>`;
        } else {

            const minusDisabled = product.quantity === 1 ? 'disabled style="opacity: 0.4; pointer-events: none;"' : '';

            newLi.innerHTML = `
            <span class="item-name" data-index="${index}">${product.name}</span>
            <div class="center-controls">
                <button class="minus" data-tooltip="Reduce count" ${minusDisabled} data-index="${index}">-</button>
                <span class="quantity-box">${product.quantity}</span>
                <button class="plus" data-tooltip="Increase count" data-index="${index}">+</button>
            </div>
            <div class="right-controls">
                <button class="state" data-tooltip="Not bought already" data-index="${index}">Buy</button>
                <button class="remove" data-tooltip="Remove item" data-index="${index}">✕</button>
            </div>`;
        }

        list.appendChild(newLi);

        const statTag = document.createElement('span');
        statTag.classList.add('stat-tag');
        statTag.innerHTML = `${product.name} <mark>${product.quantity}</mark>`;

        if (product.isBought) {
            statTag.classList.add('purchased-tag');
            bought.appendChild(statTag);
        } else {
            remained.appendChild(statTag);
        }
    });

    localStorage.setItem('filled_basket', JSON.stringify(products));
}

list.addEventListener('click', function (event) {

    const targetEl = event.target;
    const index = targetEl.getAttribute('data-index');

    if (index === null) return;

    const idx = parseInt(index);

    if (targetEl.classList.contains('state')) {
        products[idx].isBought = true;
        render();
    } else if (targetEl.classList.contains('disabled-state')) {
        products[idx].isBought = false;
        render();
    } else if (targetEl.classList.contains('remove')) {
        products.splice(idx, 1);
        render();
    } else if (targetEl.classList.contains('plus')) {
        products[idx].quantity++;
        render();
    } else if (targetEl.classList.contains('minus')) {
        if (products[idx].quantity > 1) {
            products[idx].quantity--;
            render();
        }
    } else if (targetEl.classList.contains('item-name')) {

        const eldSpan = targetEl;
        const inputMorph = document.createElement('input');

        inputMorph.value = eldSpan.textContent;
        inputMorph.classList.add('edit-input'); 

        eldSpan.replaceWith(inputMorph);
        inputMorph.focus();

        inputMorph.addEventListener('blur', function() {

            let morphed = inputMorph.value.trim();

            if (morphed === "") {
                morphed = products[idx].name;
            }

            products[idx].name = morphed;
            render();
        });

        inputMorph.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                inputMorph.blur();
            }
        });
    }
});

form.addEventListener('submit', function (event) {

    event.preventDefault();

    let textFromUser = input.value;
    let newProductObject = {
        name: textFromUser,
        quantity: 1,
        isBought: false
    };

    products.push(newProductObject);
    render();

    input.value = "";
    input.focus();
});

render();