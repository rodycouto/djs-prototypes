import { Client, Collection, GuildEmoji, GuildEmojiManager } from "discord.js";
import { isRegExp } from "util/types";
import { compareStrings } from "../utils";

export class GuildEmojis {
  declare cache: GuildEmojiManager["cache"];
  declare client: Client<true>;

  constructor() {
    Object.defineProperties(GuildEmojiManager.prototype, {
      getById: { value: this.getById },
      filterByAuthorId: { value: this.filterByAuthorId },
      getByName: { value: this.getByName },
      filterAnimateds: { value: this.filterAnimateds },
      filterStatics: { value: this.filterStatics },
      filterAvailables: { value: this.filterAvailables },
      filterUnavailables: { value: this.filterUnavailables },
      filterDeletables: { value: this.filterDeletables },
      filterUndeletables: { value: this.filterUndeletables },
      searchBy: { value: this.searchBy },
      _searchByRegExp: { value: this._searchByRegExp },
      _searchByString: { value: this._searchByString },
    });
  }

  getById(id: string) {
    return this.cache.get(id);
  }

  getByName(name: string | RegExp) {
    if (typeof name !== "string" && !isRegExp(name)) return;

    return this.cache.find(emoji => {
      if (emoji.name === null) return false;

      if (typeof name === "string") {
        return compareStrings(emoji.name, name);
      }

      return name.test(emoji.name);
    });
  }

  filterByAuthorId(id: string) {
    if (typeof id !== "string") return new Collection<string, GuildEmoji>();
    return this.cache.filter(emoji => emoji.author?.id === id);
  }

  filterAnimateds() {
    return this.cache.filter(emoji => emoji.animated);
  }

  filterStatics() {
    return this.cache.filter(emoji => !emoji.animated);
  }

  filterAvailables() {
    return this.cache.filter(emoji => emoji.available);
  }

  filterUnavailables() {
    return this.cache.filter(emoji => !emoji.available);
  }

  filterDeletables() {
    return this.cache.filter(emoji => emoji.deletable);
  }

  filterUndeletables() {
    return this.cache.filter(emoji => !emoji.deletable);
  }

  searchBy(query: string | RegExp | Search) {
    if (typeof query === "string") return this._searchByString(query);
    if (isRegExp(query)) return this._searchByRegExp(query);

    return this.cache.find(emoji =>
      (
        query.id && (
          typeof query.id === "string" ?
            compareStrings(query.id, emoji.id) :
            query.id.test(emoji.id)
        )
      ) || (
        query.name && emoji.name && (
          typeof query.name === "string" ?
            compareStrings(query.name, emoji.name) :
            query.name.test(emoji.name)
        )
      ));
  }

  protected _searchByRegExp(query: RegExp) {
    return this.cache.find((emoji) =>
      query.test(emoji.id) ||
      (emoji.name && query.test(emoji.name)));
  }

  protected _searchByString(query: string) {
    return this.cache.get(query) ??
      this.cache.find((emoji) => [
        emoji.name,
      ].includes(query.toLowerCase()));
  }
}

interface Search {
  id?: string | RegExp
  name?: string | RegExp
}
