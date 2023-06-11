import {
    BaseAbility,
    BaseModifier,
    registerAbility,
    registerModifier,
} from "../../../lib/dota_ts_adapter";

@registerAbility()
export class geminate_attack_ushlepok extends BaseAbility {
    GetIntrinsicModifierName(): string {
        return "modifier_geminate_attack_ushlepok";
    }
}

@registerModifier()
export class modifier_geminate_attack_ushlepok extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_ATTACK];
    }
    OnCreated(params: object): void {
        if (!IsServer()) return;
    }
    OnAttack(event: ModifierAttackEvent): void {
        if (!IsServer()) return;
        if (
            event.attacker != this.GetAbility()?.GetCaster() ||
            !this.GetAbility()?.IsFullyCastable()
        )
            return;
        if (
            event.no_attack_cooldown ||
            this.GetAbility()?.GetCaster().IsIllusion() ||
            this.GetAbility()?.GetCaster().PassivesDisabled()
        )
            return;
        if (
            event.target.GetUnitName() == "npc_dota_observer_wards" ||
            event.target.GetUnitName() == "npc_dota_sentry_wards"
        )
            return;
        let modifier = event.target.AddNewModifier(
            this.GetAbility()?.GetCaster(),
            this.GetAbility(),
            "modifier_geminate_attack_handler_ushlepok",
            {}
        );
        modifier.SetStackCount(
            this.GetAbility()!.GetSpecialValueFor("tooltip_attack")
        );
        this.GetAbility()?.UseResources(true, true, true);
    }
}

@registerModifier()
export class modifier_geminate_attack_handler_ushlepok extends BaseModifier {
    ability = this.GetAbility()!;
    bonus_damage = this.ability.GetSpecialValueFor("bonus_damage");
    attack_bonus?: boolean;
    IsHidden() {
        return false;
    }
    IsPurgable(): boolean {
        return false;
    }
    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE + ModifierAttribute.PERMANENT;
    }
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.PREATTACK_BONUS_DAMAGE];
    }
    GetModifierPreAttack_BonusDamage(): number {
        if (!IsServer() || !this.attack_bonus) return 0;
        return this.bonus_damage;
    }
    OnCreated(params: object): void {
        if (!IsServer()) return;

        this.StartIntervalThink(this.ability.GetSpecialValueFor("delay"));
    }
    OnIntervalThink(): void {
        if (this.ability.GetCaster().IsAlive()) {
            this.attack_bonus = true;
            this.ability
                .GetCaster()
                .PerformAttack(
                    this.GetParent(),
                    true,
                    true,
                    true,
                    false,
                    true,
                    false,
                    false
                );
            this.attack_bonus = false;
        }
        let stacks = this.GetStackCount() - 1;
        if (stacks < 1) {
            this.Destroy();
        } else this.SetStackCount(stacks);
    }
}
