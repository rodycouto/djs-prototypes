import { APIChannel, ChannelManager, ChannelType, Client, Collection } from "discord.js";
import { resolveEnum } from "../utils";

export class Channels {
  declare cache: ChannelManager["cache"];
  declare client: Client<true>;

  constructor() {
    Object.defineProperties(ChannelManager.prototype, {
      getById: { value: this.getById },
      getByName: { value: this.getByName },
      getByTopic: { value: this.getByTopic },
      getByTypes: { value: this.getByTypes },
      getByUrl: { value: this.getByUrl },
      getCategoryById: { value: this.getCategoryById },
      getCategoryByName: { value: this.getCategoryByName },
      getInShardsById: { value: this.getInShardsById },
      getInShardsByName: { value: this.getInShardsByName },
    });
  }

  getById<T extends ChannelType | keyof typeof ChannelType>(id: string, type?: T) {
    if (typeof id !== "string") return;
    const channel = this.cache.get(id);
    if (!type) return channel;
    if (channel?.type === resolveEnum(ChannelType, type)) return channel;
  }

  getByName<T extends ChannelType | keyof typeof ChannelType>(name: string | RegExp, type?: T) {
    if (!name) return;

    return this.cache.find(channel => {
      if (type && channel.type !== resolveEnum(ChannelType, type)) return false;

      if ("name" in channel && channel.name) {
        if (typeof name === "string") {
          return channel.name === name;
        }

        if (name instanceof RegExp)
          return name.test(channel.name);
      }
    });
  }

  getByTopic<T extends ChannelType | keyof typeof ChannelType>(topic: string | RegExp, type?: T) {
    if (!topic) return;

    return this.cache.find(channel => {
      if (type && channel.type !== resolveEnum(ChannelType, type)) return false;

      if ("topic" in channel && channel.topic) {
        if (typeof topic === "string")
          return channel.topic === topic;

        if (topic instanceof RegExp)
          return topic.test(channel.topic);
      }
    });
  }

  getByTypes<T extends ChannelType | keyof typeof ChannelType>(type: T | T[]): Collection<string, T> {
    if (Array.isArray(type)) {
      type.map(value => resolveEnum(ChannelType, value));
      return this.cache.filter(channel => type.includes(channel.type as T)) as any;
    }

    return this.cache.filter(channel => channel.type === resolveEnum(ChannelType, type)) as any;
  }

  getByUrl(url: string) {
    return this.cache.find(channel => channel.url === url);
  }

  getCategoryById(id: string) {
    if (typeof id !== "string") return;
    const category = this.cache.get(id);
    if (category?.type !== ChannelType.GuildCategory) return;
    return category;
  }

  getCategoryByName(name: string | RegExp) {
    if (!name) return;

    return this.cache.find(channel => {
      if (channel.type !== ChannelType.GuildCategory) return false;

      if ("name" in channel && channel.name) {
        if (typeof name === "string") {
          return channel.name === name;
        }

        if (name instanceof RegExp)
          return name.test(channel.name);
      }
    });
  }

  async getInShardsById(id: string) {
    if (!id) return null;

    return await this.client.shard?.broadcastEval((shard, id) => shard.channels.getById(id), { context: id })
      .then(res => res.find(Boolean) as APIChannel | undefined)
      .catch(() => null);
  }

  async getInShardsByName(name: string | RegExp) {
    if (!name || !this.client.shard) return null;

    const isRegExp = name instanceof RegExp;
    let flags: string | undefined;

    if (name instanceof RegExp) {
      flags = name.flags;
      name = name.source;
    }

    return await this.client.shard.broadcastEval((shard, { flags, isRegExp, name }) =>
      shard.channels.getByName(isRegExp ? RegExp(name, flags) : name), { context: { name, isRegExp, flags } })
      .then(res => res.find(Boolean) as APIChannel | null)
      .catch(() => null);
  }
}