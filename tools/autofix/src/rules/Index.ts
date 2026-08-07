import { Rule } from "../types.js";
import AliasResolverRule from "./AliasResolverRule.js";
import BrokenGeneratorRegistrationRule from "./BrokenGeneratorRegistrationRule.js";
import EnumResolverRule from "./EnumResolverRule.js";
import IdentityMigrationRule from "./IdentityMigrationRule.js";
import ImportResolverRule from "./ImportResolverRule.js";
import MissingDependencyRule from "./MissingDependencyRule.js";
import MissingExportRule from "./MissingExportRule.js";
import MissingHookRule from "./MissingHookRule.js";
import MissingImportRule from "./MissingImportRule.js";
import MissingPageRule from "./MissingPageRule.js";
import MissingPermissionRule from "./MissingPermissionRule.js";
import MissingRegistryRule from "./MissingRegistryRule.js";
import MissingRepositoryRule from "./MissingRepositoryRule.js";
import MissingServiceRule from "./MissingServiceRule.js";
import MissingValidatorRule from "./MissingValidatorRule.js";
import NextResolverRule from "./NextResolverRule.js";
import NullableResolverRule from "./NullableResolverRule.js";
import PermissionResolverRule from "./PermissionResolverRule.js";
import PrismaResolverRule from "./PrismaResolverRule.js";
import ReactResolverRule from "./ReactResolverRule.js";
import RelationResolverRule from "./RelationResolverRule.js";
import RepositoryResolverRule from "./RepositoryResolverRule.js";
import RouteResolverRule from "./RouteResolverRule.js";
import TypeResolverRule from "./TypeResolverRule.js";
import WrongAliasImportRule from "./WrongAliasImportRule.js";
import WrongPrismaTypeRule from "./WrongPrismaTypeRule.js";
import WrongRelativeImportRule from "./WrongRelativeImportRule.js";
import WrongRouteRule from "./WrongRouteRule.js";

export interface IRulesFactory {
  createDefaultRules(): Rule[];
}

export function createDefaultRules(): Rule[] {
  return [
    new ImportResolverRule(),
    new PrismaResolverRule(),
    new TypeResolverRule(),
    new NullableResolverRule(),
    new RelationResolverRule(),
    new EnumResolverRule(),
    new MissingImportRule(),
    new WrongPrismaTypeRule(),
    new WrongRouteRule(),
    new MissingRepositoryRule(),
    new MissingServiceRule(),
    new MissingPermissionRule(),
    new MissingValidatorRule(),
    new MissingHookRule(),
    new MissingExportRule(),
    new MissingRegistryRule(),
    new MissingDependencyRule(),
    new MissingPageRule(),
    new WrongRelativeImportRule(),
    new WrongAliasImportRule(),
    new BrokenGeneratorRegistrationRule(),
    new IdentityMigrationRule(),
    new AliasResolverRule(),
    new RouteResolverRule(),
    new ReactResolverRule(),
    new NextResolverRule(),
    new PermissionResolverRule(),
    new RepositoryResolverRule()
  ].sort((left, right) => right.manifest.priority - left.manifest.priority);
}
