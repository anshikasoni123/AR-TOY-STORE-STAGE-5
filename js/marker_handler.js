var userId = null;

AFRAME.registerComponent("marker-handler",{
    init: async function(){

        if(userId === null){
            this.askUserId();
        }

        var toys = await this.getAllToys();
        this.el.addEventListener("markerFound",()=>{
            var markerId = this.el.id;
            this.handleMarkerFound(toys,markerId);
        })
        this.el.addEventListener("markerLost",()=>{
            console.log("marker lost")
            this.handleMarkerLost();
        })
    },
    askUserId:function(){
        var icon_url="https://www.vecteezy.com/free-vector/toy-logo "
      swal({
        title:"WELCOME TO THE TOY STORE",
          icon:icon_url,
          content:{
             element:"input",
             attributes:{
                placeholder:"write userId here !!",
                type:"number",
                min:1
             }
          }
      })
    },
    handleMarkerFound:function(toys,markerId){
        if(toy.is_out_of_stock === "true"){
                swal({
                    title:"Sorry",
                    icon:"warning",
                    text:"Item is out of stock!!!",
                    button:"Reqest for item"
                })
        }
        else{
             model.setAttribute("visible",true);

            var ingredientsContainer = document.querySelector(`#main-plane-${toy.id}`);     
            ingredientsContainer.setAttribute("visible",true);

            var priceplane = document.querySelector(`#price-plane-${toy.id}`);
            priceplane.setAttribute("visible",true);

            var buttonDiv = document.getElementById("button-div");
            buttonDiv.style.display = "flex";
    
            var summery_button = document.getElementById("order-summary-button");
            var order_button = document.getElementById("order-now-button");
            var payButton = document.getElementById("pay-button");
    
            summery_button.addEventListener("click",()=>{
              this.handleOrderSummary();
            })
    
            order_button.addEventListener("click",()=>{
                var uNumber;
    
                userId <= 9 ? (uNumber = `T0${userId}`):uNumber = `T${userId}`;
    
                this.handleOrder(uNumber,toy)
    
                swal({
                   icon:"https://i.imgur.com/4NZ6uLY.jpg",
                   title:"Confirmation",
                   text:"Are you sure, you want to order this item ?",
                   buttons:true
                })
                .then((confirm)=>{
                    if(confirm){
                        swal({
                            icon:"success",
                            title:"Order placed😍😍", 
                            text:"You will soon recieve your order👜👜",
                            button:"Ahh Yess!"
                        })
                    }
                    else{
                        swal({
                            icon:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN0ICo7jOU0SxqH76t81LF5pdsC-UIOTX90Q&usqp=CAU",
                            title:"No Worry🙁🙁",
                            text:"Please look at other best items👗👠👚👓🎩"
                        })
                    }
                })
    
            })

            payButton.addEventListener("click",() => this.handlePayment());
    
        var toy = toys.filter(toy => toy.id === markerId)[0];
    
        var model = document.querySelector(`#model-${toy.id}`);
        model.setAttribute("position", toy.model_geometry.position);
        model.setAttribute("rotation", toy.model_geometry.rotation);
        model.setAttribute("scale", toy.model_geometry.scale);
        }
       
    },
    handlePayment: function () {
        // Close Modal
        document.getElementById("modal-div").style.display = "none";
    
        // Getting Table Number
        var tNumber;
        tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
    
        //Reseting current orders and total bill
        firebase
          .firestore()
          .collection("tables")
          .doc(tNumber)
          .update({
            current_orders: {},
            total_bill: 0
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks For Paying !",
              text: "We Hope You Enjoyed You Toy Will Successfully Reach To You !!",
              timer: 2500,
              buttons: false
            });
          });
      },
    handleMarkerLost:function(){
        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "none";
    },
    handleOrder:function(uNumber,toy){
        firebase
        .firestore()
        .collection("users")
        .doc(uNumber)
        .get()
        .then(doc => {
            var details = doc.data();
            if(details["current_orders"][toy.id]){
                details["current_orders"][toy.id]["quantity"] += 1;

                var current_quantity = details["current_orders"][toy.id]["quantity"];

                details["current_orders"][toy.id]["subtotals"] = current_quantity * toy.price
            }
            else{
                details["current_orders"][toy.id] = {
                    item:toy.id,
                    price:toy.price,
                    quantity:toy.quantity,
                    subtotal:toy.subtotal
                }
            }
            details.total_bill += toy.price;

            firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .update(details)
        })
    },
    getAllToys:async function(){
        return await firebase
        .collection("toys")
        .get()
        .then(snap => {
            return snap.docs.map(doc => doc.data());
        })
    },
    getOrderSummary:async function(uNumber){
        firebase
        .firestore()
        .collection("users")
        .doc(uNumber)
        .get()
        .then(doc => doc.data());
    },
    handleOrderSummary:async function(){
        var uNumber;
        userId <=9?(uNumber = `T0${userId}`):`T${userId}`;

        var model = document.getElementById("modal-div");
        model.style.display = "flex";

        var orderSummary = await this.getOrderSummary(uNumber);

        var tableBodyTag = document.getElementById("");
        tableBodyTag.innerHTML = "";

        var currentOrders = Object.keys(orderSummary.current_orders);

        currentOrders.map(i => {
            var td = document.createElement("td");

            var item = document.createElement("tr");
            var price = document.createElement("tr");
            var quantity = document.createElement("tr");
            var subtotal = document.createElement("tr");

            item.innerHTML = orderSummary.current_orders[i].item;

            price = "$" + orderSummary.current_orders[i].price;
            price.setAttribute("class","text-center");

            quantity = orderSummary.current_orders[i].quantity;
            quantity.setAttribute("class","text-center");

            subtotal = "$" + orderSummary.current_orders[i].subtotal;
            subtotal.setAttribute("class","text-center");

            td.appendChild(item);
            td.appendChild(price);
            td.appendChild(quantity);
            td.appendChild(subtotal);

            tableBodyTag.appendChild(td);

        });

        var totalTr = document.createElement("tr");
        
        var td1 = document.createElement("td");
        td1.setAttribute("class","no-line");

        var td2 = document.createElement("td");
        td2.setAttribute("class","no-line");

        var td3 = document.createElement("td");
        td3.setAttribute("class","no-line");

        var strongTag = document.createElement("strong");
        strongTag.innerHTML = "TOTAL";

        var td4 = document.createElement("td");
        td4.setAttribute("class","no-line right-text");
        td4.innerHTML = "$" + orderSummary.total_bill; 

        totalTr.appendChild(td1);
        totalTr.appendChild(td2);
        totalTr.appendChild(td3);
        totalTr.appendChild(td4);

        tableBodyTag.appendChild(totalTr);

    }
})