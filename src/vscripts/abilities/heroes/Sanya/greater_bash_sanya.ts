import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
@registerAbility()
export class greater_bash_sanya extends BaseAbility {
    GetIntrinsicModifierName(): string {
        return "modifier_greater_bash_sanya";
    }
}

@registerModifier()
export class modifier_greater_bash_sanya extends BaseModifier {
    bash_chance?: number;
    bash_damage?: number;
    bash_duration?: number;

    IsHidden(): boolean {
        return true;
    }
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_ATTACK_LANDED];
    }
    IsDebuff(): boolean {
        return false;
    }
    IsPurgable(): boolean {
        return false;
    }
    RemoveOnDeath(): boolean {
        return false;
    }
    OnCreated(params: object): void {
        PrintLinkedConsoleMessage("Initiated ", "OnCreated:");
        if (this.GetAbility()) {
            this.bash_chance =
                this.GetAbility()!.GetSpecialValueFor("chance_pct");
            this.bash_damage = this.GetAbility()!.GetSpecialValueFor("damage");
            this.bash_duration =
                this.GetAbility()!.GetSpecialValueFor("duration");
        } else {
            PrintLinkedConsoleMessage(
                "Error with special values greater_bash_sanya modifier",
                "OnCreated"
            );
        }
    }
    OnRefresh(params: object): void {
        this.OnCreated(params);
    }
    OnAttackLanded(event: ModifierAttackEvent): void {
        if (IsClient()) return;
        PrintLinkedConsoleMessage("ATTACK LANDED!\n", "OnAttackLanded");
        if (
            event.attacker == this.GetAbility()?.GetCaster() &&
            event.attacker.PassivesDisabled() == false &&
            (event.target.IsHero() || event.target.IsCreep()) &&
            event.target.GetTeam() != event.attacker.GetTeam()
        ) {
            if (RollPercentage(this.bash_chance ?? 100)) {
                EmitSoundOn("Hero_Spirit_Breaker.GreaterBash", event.target);

                let bash_particle = ParticleManager.CreateParticle(
                    "particles/units/heroes/hero_spirit_breaker/spirit_breaker_greater_bash.vpcf",
                    ParticleAttachment.ABSORIGIN_FOLLOW,
                    event.target
                );
                ParticleManager.ReleaseParticleIndex(bash_particle);

                ApplyDamage({
                    attacker: event.attacker,
                    damage: this.bash_damage ?? 0,
                    damage_type: DamageTypes.PHYSICAL,
                    victim: event.target,
                });
                event.target.AddNewModifier(
                    this.GetCaster(),
                    this.GetAbility(),
                    "modifier_stunned",
                    { duration: this.bash_duration }
                );
            }
        }
    }
}
