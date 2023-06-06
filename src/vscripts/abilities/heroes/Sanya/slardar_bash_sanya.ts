import {
    BaseAbility,
    BaseModifier,
    registerAbility,
    registerModifier,
} from "../../../lib/dota_ts_adapter";

@registerAbility()
export class slardar_bash_sanya extends BaseAbility {
    GetIntrinsicModifierName() {
        return "modifier_slardar_bash_sanya";
    }
}

@registerModifier()
export class modifier_slardar_bash_sanya extends BaseModifier {
    bonus_damage?: number;
    bash_duration?: number;
    attack_count?: number;
    IsPurgable(): boolean {
        return false;
    }
    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.PROCATTACK_BONUS_DAMAGE_PHYSICAL,
            ModifierFunction.ON_ATTACK_LANDED,
        ];
    }
    IsHidden(): boolean {
        if (this.GetStackCount() == 0) return true;
        else return false;
    }
    OnCreated(params: object): void {
        if (this.GetAbility()) {
            this.bonus_damage =
                this.GetAbility()!.GetSpecialValueFor("bonus_damage");
            this.bash_duration =
                this.GetAbility()!.GetSpecialValueFor("duration");
            this.attack_count =
                this.GetAbility()!.GetSpecialValueFor("attack_count");
        } else {
            PrintLinkedConsoleMessage(
                "Error with special values slardar_bash_sanya modifier",
                "OnCreated"
            );
        }
        if (IsServer()) {
            this.SetStackCount(0);
        }
    }
    OnRefresh(params: object): void {
        this.OnCreated(params);
    }
    OnAttackLanded(event: ModifierAttackEvent): void {
        if (
            event.attacker == this.GetAbility()?.GetCaster() &&
            event.attacker.PassivesDisabled() == false &&
            (event.target.IsHero() || event.target.IsCreep()) &&
            event.target.GetTeam() != event.attacker.GetTeam()
        ) {
            if (this.GetStackCount() < (this.attack_count ?? 0)) {
                this.IncrementStackCount();
            } else {
                this.SetStackCount(0);
                EmitSoundOn("Hero_Slardar.Bash", event.target);
                event.target.AddNewModifier(
                    event.attacker,
                    this.GetAbility(),
                    "modifier_stunned",
                    {
                        duration: this.bash_duration,
                    }
                );
            }
        }
    }
    GetModifierProcAttack_BonusDamage_Physical(
        event: ModifierAttackEvent
    ): number {
        if (this.GetStackCount() == this.attack_count) {
            return this.bonus_damage ?? 0;
        } else return 0;
    }
}
