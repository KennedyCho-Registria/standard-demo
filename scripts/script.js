
// store current path 
path = window.location.pathname.split("/")
// eval path name, store as bool
let home = path[path.length-1] == 'index.html';
// console.log(home);

// && counter < master[journey+1].length
if (home){
    let counter = 0; 
    let journey = 0;

    console.log("Reset: ", counter, journey);
}else if(!home){
    counter += 1;
    console.log(counter);
    window.onload=()=>{
        // update next button 
        document.getElementById("next_button").href = master[journey+1][counter]
    };
}
// if the master[journey+1][counter] != path minus 1 to counter - back handler 

function getJourney(e) {
    let response = e.target.getElementsByTagName("h3")[0].innerHTML;
    let journey = master[0].findIndex(function (el, index, array) {
        return el == response;
    })
    e.target.href = master[journey+1][counter]
}

let master = [["Full OX", "Basic", "Onboard & Protect", "Onboard & Shop", "Onboard & Create Account"], ['main-reg.html', 'pop.html', 'esp.html', 'cart.html','checkout.html', 'confirmation.html'], ["main-reg.html", "confirmation.html"], ["main-reg.html", "esp.html", "cart.html","checkout.html", "confirmation.html"],["main-reg.html", "merchandise.html", "cart.html","checkout.html", "confirmation.html"],[]]
