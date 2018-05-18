import axios from "axios";

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const key = "a29e6f0d970c58f6b815fcf932d8b209";
    const url = "http://food2fork.com/api/search";

    try {
      const res = await axios(`${proxy}${url}?key=${key}&q=${this.query}`);
      this.result = res.data.recipes;
    } catch (error) {
      alert(error);
    }
  }
}
