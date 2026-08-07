export interface NameVariants {
  raw: string;
  camel: string;
  kebab: string;
  pascal: string;
  pluralCamel: string;
  pluralKebab: string;
  pluralPascal: string;
  singular: string;
  snake: string;
  title: string;
}

export interface INameFormatter {
  format(value: string): NameVariants;
}

export class NameFormatter implements INameFormatter {
  format(value: string): NameVariants {
    const words = this.splitWords(value);
    const singularWords = words.length > 0 ? words : ["module"];
    const singular = singularWords.map((word) => this.capitalize(word)).join(" ");
    const kebab = singularWords.join("-");
    const snake = singularWords.join("_");
    const pascal = singularWords.map((word) => this.capitalize(word)).join("");
    const camel = pascal.length > 0 ? `${pascal[0].toLowerCase()}${pascal.slice(1)}` : "module";
    const title = singularWords.map((word) => this.capitalize(word)).join(" ");
    const pluralWords = [...singularWords];
    const lastWord = pluralWords[pluralWords.length - 1] ?? "module";
    pluralWords[pluralWords.length - 1] = this.pluralize(lastWord);
    const pluralPascal = pluralWords.map((word) => this.capitalize(word)).join("");
    const pluralCamel = pluralPascal.length > 0 ? `${pluralPascal[0].toLowerCase()}${pluralPascal.slice(1)}` : "modules";
    const pluralKebab = pluralWords.join("-");

    return {
      raw: value,
      camel,
      kebab,
      pascal,
      pluralCamel,
      pluralKebab,
      pluralPascal,
      singular,
      snake,
      title
    };
  }

  private splitWords(value: string): string[] {
    return value
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((word) => word.toLowerCase())
      .filter((word) => word.length > 0);
  }

  private capitalize(value: string): string {
    return value.length > 0 ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
  }

  private pluralize(value: string): string {
    if (/[^aeiou]y$/i.test(value)) {
      return `${value.slice(0, -1)}ies`;
    }

    if (/(s|x|z|ch|sh)$/i.test(value)) {
      return `${value}es`;
    }

    return `${value}s`;
  }
}
