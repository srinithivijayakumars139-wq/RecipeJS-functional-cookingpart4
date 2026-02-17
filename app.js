const RecipeApp = (() => {

  // ------------------ DATA ------------------

  const recipes = [
    {
      id: 1,
      name: "Pasta Alfredo",
      difficulty: "Easy",
      time: 20,
      ingredients: ["Pasta", "Cream", "Garlic", "Cheese"],
      steps: [
        "Boil pasta",
        {
          title: "Prepare Sauce",
          substeps: ["Heat pan", "Add garlic", "Add cream", "Add cheese"]
        },
        "Mix pasta with sauce"
      ]
    },
    {
      id: 2,
      name: "Chicken Biryani",
      difficulty: "Hard",
      time: 60,
      ingredients: ["Rice", "Chicken", "Spices", "Onion"],
      steps: [
        "Marinate chicken",
        {
          title: "Layering",
          substeps: [
            "Add rice",
            "Add chicken",
            {
              title: "Final Steam",
              substeps: ["Cover tightly", "Cook 15 mins"]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Omelette",
      difficulty: "Easy",
      time: 5,
      ingredients: ["Eggs", "Salt", "Pepper"],
      steps: ["Beat eggs", "Heat pan", "Cook eggs"]
    }
  ];

  // ------------------ STATE ------------------

  let currentFilter = "all";
  let currentSort = null;
  let searchQuery = "";
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const container = document.getElementById("recipes-container");
  const counter = document.getElementById("recipeCounter");

  // ------------------ UTILITIES ------------------

  const saveFavorites = () => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ------------------ FILTERS ------------------

  const applyFilter = (data) => {
    if (currentFilter === "favorites") {
      return data.filter(r => favorites.includes(r.id));
    }

    if (currentFilter === "easy")
      return data.filter(r => r.difficulty === "Easy");

    if (currentFilter === "medium")
      return data.filter(r => r.difficulty === "Medium");

    if (currentFilter === "hard")
      return data.filter(r => r.difficulty === "Hard");

    if (currentFilter === "quick")
      return data.filter(r => r.time < 30);

    return data;
  };

  const applySearch = (data) => {
    if (!searchQuery) return data;

    return data.filter(recipe =>
      recipe.name.toLowerCase().includes(searchQuery) ||
      recipe.ingredients.some(i =>
        i.toLowerCase().includes(searchQuery)
      )
    );
  };

  const applySort = (data) => {
    if (!currentSort) return data;

    const copy = [...data];

    if (currentSort === "name")
      return copy.sort((a, b) => a.name.localeCompare(b.name));

    if (currentSort === "time")
      return copy.sort((a, b) => a.time - b.time);

    return copy;
  };

  // ------------------ RECURSION ------------------

  const renderSteps = (steps) => `
    <ul>
      ${steps.map(step => {
        if (typeof step === "string") {
          return `<li>${step}</li>`;
        } else {
          return `<li>${step.title}${renderSteps(step.substeps)}</li>`;
        }
      }).join("")}
    </ul>
  `;

  // ------------------ RENDER ------------------

  const renderRecipes = (data) => {
    counter.textContent = `Showing ${data.length} of ${recipes.length} recipes`;

    container.innerHTML = data.map(recipe => `
      <div class="recipe-card">
        <span class="favorite ${favorites.includes(recipe.id) ? "active" : ""}"
              data-action="favorite"
              data-id="${recipe.id}">
              ❤️
        </span>

        <h3>${recipe.name}</h3>
        <p>Difficulty: ${recipe.difficulty}</p>
        <p>Time: ${recipe.time} mins</p>

        <button data-action="toggle-ingredients" data-id="${recipe.id}">
          Show Ingredients
        </button>
        <button data-action="toggle-steps" data-id="${recipe.id}">
          Show Steps
        </button>

        <div class="ingredients hidden" id="ingredients-${recipe.id}">
          <ul>
            ${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}
          </ul>
        </div>

        <div class="steps hidden" id="steps-${recipe.id}">
          ${renderSteps(recipe.steps)}
        </div>
      </div>
    `).join("");
  };

  // ------------------ UPDATE FLOW ------------------

  const updateDisplay = () => {
    let result = applyFilter(recipes);
    result = applySearch(result);
    result = applySort(result);
    renderRecipes(result);
  };

  // ------------------ EVENTS ------------------

  const handleClick = (e) => {

    if (e.target.dataset.filter) {
      currentFilter = e.target.dataset.filter;
      updateDisplay();
    }

    if (e.target.dataset.sort) {
      currentSort = e.target.dataset.sort;
      updateDisplay();
    }

    if (e.target.dataset.action === "favorite") {
      const id = Number(e.target.dataset.id);

      if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
      } else {
        favorites.push(id);
      }

      saveFavorites();
      updateDisplay();
    }

    if (e.target.dataset.action === "toggle-ingredients") {
      document.getElementById(`ingredients-${e.target.dataset.id}`)
        .classList.toggle("hidden");
    }

    if (e.target.dataset.action === "toggle-steps") {
      document.getElementById(`steps-${e.target.dataset.id}`)
        .classList.toggle("hidden");
    }
  };

  const handleSearch = debounce((e) => {
    searchQuery = e.target.value.toLowerCase();
    updateDisplay();
  }, 300);

  // ------------------ INIT ------------------

  const init = () => {
    document.body.addEventListener("click", handleClick);
    document.getElementById("searchInput")
      .addEventListener("input", handleSearch);
    updateDisplay();
  };

  return { init };

})();

RecipeApp.init();
