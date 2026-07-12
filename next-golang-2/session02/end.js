
console.log("console pertama kali")

// var name = "Ganesha"
// console.log(name)

// let name = "ganesha"
// console.log("name ==> ", name)

 // function declaration
function sayHello() {
    console.log("hello")
}

// num disini adalah parameter 
function sayHelloMultiple(num) {
    // this 
    for(let i = 1; i <= num; i++){
        console.log("Hello ke :", i)
    }
}


// function by expression , arrow function
const sayHelloAgain = (num) => {
    // gak ada this 
    for(let i = 1; i <= num; i++){
        console.log("Hello ke :", i)
    }
}