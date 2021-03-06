import ko from "knockout";
import pager from "pagerjs";

import config from "../config";
import documentselection from "./documentselection";
import Cart from "./cart";
import Document from "./document";
import PrintJob from "./printjob";

export default class Preselection {
  constructor() {
    this.carts = [];
    this.filter = '';
    this.defaultLimit = 15;
    this.limit = this.defaultLimit;

    ko.track(this);
    this.loadCarts();
  }

  filteredCarts() {
    let regex = new RegExp(this.filter, "i");
    let filtered = this.carts.filter(c => regex.test(c.name));

    // sort by creation time in descending order
    filtered.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      // make sure there's some deterministic order even for simultaneously
      // created carts
      return a.name < b.name ? -1 : -1;
    });
    if (this.limit !== -1) {
      filtered = filtered.slice(0, this.limit - 1);
    }
    return filtered;
  }

  showAllCarts() {
    this.limit = -1;
  }

  loadCarts() {
    config.getJSON('/data/carts')
      .done(data => {
        this.carts = data.map(d => {
          let c = new Cart();
          c.id = d.id;
          c.name = d.name;
          c.date = new Date(d.creationTime);
          d.documents.forEach(doc => c.add(new Document(doc)));
          return c;
        });
      });
    this.limit = this.defaultLimit;
  }

  openCart(cart) {
    documentselection.cart = cart;
    pager.navigate('#documentselection');
  }

  deleteCart(cart) {
    config.ajax({
      url: '/data/carts/' + cart.id,
      type: 'DELETE'
    }).done(() => {
      let i = this.carts.indexOf(cart);
      if (i > -1) {
        // remove from cart listing
        this.carts.splice(i, 1);
      }
    });
  }
}
