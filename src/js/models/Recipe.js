import axios from "axios";
import { proxy, key, url } from "../config";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(`${proxy}${url}/get?key=${key}&rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
    }
  }

  calcTime() {
    // Assuming 15mins to cook per 3 ingredients
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "teaspoons",
      "teaspoon",
      "ounces",
      "ounce",
      "cups",
      "pounds"
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "tsp",
      "tsp",
      "oz",
      "oz",
      "cup",
      "pound"
    ];
    const units = [...unitsShort, "kg", "g"];

    // process the ingredients array
    const newIngredients = this.ingredients.map(el => {
      // 1. Standardize units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      // 2. Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      // 3. Parse ingredients into count, unit, ingredient
      // split the array items
      const ingArr = ingredient.split(" ");
      const unitIndex = ingArr.findIndex(arrEl => units.includes(arrEl));

      let objIng;
      if (unitIndex > -1) {
        // unit exits
        // cut the elements the before the unit and store in an array
        const arrCount = ingArr.slice(0, unitIndex);

        let count;
        // there is single digit
        if (arrCount.length === 1) {
          count = eval(ingArr[0].replace("-", "+"));
        } else {
          count = eval(ingArr.slice(0, unitIndex).join("+"));
        }

        objIng = {
          count,
          unit: ingArr[unitIndex],
          ingredient: ingArr.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(ingArr[0], 10)) {
        // no unit, but a number
        objIng = {
          count: parseInt(ingArr[0], 10),
          unit: "",
          ingredient: ingArr.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        // unit doesnt exits
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }

      return objIng;
    });

    // set the ingredients as the ingredients property
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // Check servings update type
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    // Update ingredients count
    this.ingredients.forEach(ing => {
      const fr = newServings / this.servings;
      ing.count *= fr;
    });

    this.servings = newServings;
  }
}
