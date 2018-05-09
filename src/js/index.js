import axios from "axios";

async function getResults(query) {
  const proxy = "https://cors-anywhere.herokuapp.com/";
  const key = "a29e6f0d970c58f6b815fcf932d8b209";
  const url = "http://food2fork.com/api/search";

  try {
    const res = await axios(`${proxy}${url}?key=${key}&q=${query}`);
    const recipes = res.data.recipes;
    console.log(recipes);
  } catch (error) {
    alert(error);
  }
}

getResults("cake");
