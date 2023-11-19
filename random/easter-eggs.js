const columnLoob = document.getElementById("column-loob");

// make Loob do a lil flip when you click on him
columnLoob.addEventListener("click", () => {
    console.log("clicked on loob");
    columnLoob.classList.add("rotate");
    setTimeout(() => {
        columnLoob.classList.remove("rotate");
    }, 2000);
});
