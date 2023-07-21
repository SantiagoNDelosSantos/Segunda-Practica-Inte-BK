// Iniciar Socket:
const socket = io();

// Captura div head:
const head = document.getElementById('head');

// Captura parrafo 
const ParfCarts = document.getElementById('Parrafo');

// Captura tabla de carritos
const tableCarts = document.getElementById('tableCarts');

// Función para cargar la vista principal de carritos
function allCarts() {
  console.log("Carga carritos");

  socket.on("carritos", (carts) => {
    // Head:
    let htmlHead = "";
    htmlHead += `
      <h1>Carritos:</h1>
    `;
    head.innerHTML = htmlHead;

    let htmlCarritos = "";

    // Cuerpo:
    htmlCarritos += `
      <thead>
        <tr>
          <th>Carrito - ID</th>
          <th>Select Cart</th>
        </tr>
      </thead>`;

    carts.docs.forEach((cart) => {
      htmlCarritos += `
        <tr>
          <td><h2>${cart._id}</h2></td>
          <td><p class="boton" id="selt${cart._id}">Select</p></td>
        </tr>`;
    });

    tableCarts.innerHTML = htmlCarritos;

    // Obtengo el id de cada boton Select:
    carts.docs.forEach((cart) => {
      const botonSelect = document.getElementById(`selt${cart._id}`);
      botonSelect.addEventListener('click', () => {
        let htmlHead = "";

        htmlHead += `
        <h2 style="margin-top: 1em;">Carrito: ${cart._id}</h2>
        `
        head.innerHTML = htmlHead;
        selectCart(cart._id);
      });
    });

    function selectCart(cartID) {
      socket.emit("CartCid", cartID);

      socket.on("CARTID", (cartCID) => {
        const CID = cartCID.products;

        // Cuerpo:
        let htmlCartCID = `
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Descripción</th>
              <th>Img Front</th>
              <th>Img Back</th>
              <th>Precio</th>
              <th>Cantidad</th>
            </tr>
          </thead>`;

        CID.forEach((product) => {
          const { title, description, thumbnails, price } = product.product;
          const quantity = product.quantity;
          htmlCartCID += `
            <tr>
              <td id="${title}">${title}</td>
              <td class="description">${description}</td>
              <td><img src="${thumbnails[0]}" alt="${title}" class="Imgs"></td>
              <td><img src="${thumbnails[1]}" alt="${title}" class="Imgs"></td>
              <td>$${price}</td>
              <td>${quantity}</td>
            </tr>`;
        });

        tableCarts.innerHTML = htmlCartCID;
      });
    }
  });
}

allCarts();