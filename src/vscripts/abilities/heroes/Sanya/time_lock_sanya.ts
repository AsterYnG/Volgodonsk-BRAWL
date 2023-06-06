import {
    BaseAbility,
    BaseModifier,
    registerAbility,
    registerModifier,
} from "../../../lib/dota_ts_adapter";

@registerAbility()
export class time_lock_sanya extends BaseAbility {
    GetIntrinsicModifierName() {
        return "modifier_time_lock_sanya";
    }
}

@registerModifier()
export class modifier_time_lock_sanya extends BaseModifier {
    proc_chance?: number;
    bonus_damage?: number;
    bash_duration?: number;

    IsPurgable(): boolean {
        return false;
    }
    IsDebuff(): boolean {
        return false;
    }
    IsHidden(): boolean {
        return true;
    }
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.PROCATTACK_BONUS_DAMAGE_MAGICAL];
    }
    OnCreated(params: object): void {
        if (this.GetAbility()) {
            this.proc_chance =
                this.GetAbility()!.GetSpecialValueFor("bash_chance");
            this.bonus_damage =
                this.GetAbility()!.GetSpecialValueFor("bash_damage");
            this.bash_duration =
                this.GetAbility()!.GetSpecialValueFor("bash_duration");
        }
    }
    OnRefresh(params: object): void {
        this.OnCreated(params);
    }
    GetModifierProcAttack_BonusDamage_Magical(
        event: ModifierAttackEvent
    ): number {
        if (IsClient()) return 0;

        if (RollPercentage(this.proc_chance ?? 0)) {
            if (
                event.attacker == this.GetAbility()?.GetCaster() &&
                event.attacker.PassivesDisabled() == false &&
                (event.target.IsHero() || event.target.IsCreep()) &&
                event.target.GetTeam() != event.attacker.GetTeam()
            ) {
                EmitSoundOn("Hero_Faceless_Void.TimeLock.Impact", event.target);

                let bash_particle = ParticleManager.CreateParticle(
                    "particles/units/heroes/hero_faceless_void/faceless_void_time_lock_bash_arc.vpcf",
                    ParticleAttachment.ABSORIGIN_FOLLOW,
                    event.target
                );
                ParticleManager.ReleaseParticleIndex(bash_particle);

                event.target.AddNewModifier(
                    this.GetCaster(),
                    this.GetAbility(),
                    "modifier_stunned",
                    { duration: this.bash_duration }
                );

                return this.bonus_damage ?? 0;
            }
        }
        return 0;
    }
}
