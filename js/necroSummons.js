function calculateRaiseSkeleton(skillLvl, mSkillLvl, damageAuraTotal, lifeAuraTotal) {
    // Maximum Number of Skeletons Raised, %Life, and %Damage:
    var maximumSkeles;
    var multiplierLife;
    var multiplierDamage;

    if (skillLvl < 4) {
        maximumSkeles = skillLvl;
        //Convert the damage values to multipliers (instead of hundreds of percents)
        //PercentLife and Percent damage values are just 0, so reflect the Aura values instead:
        multiplierLife = 1 + (lifeAuraTotal/100);
        multiplierDamage = 1 + (damageAuraTotal/100);
    } else {
        maximumSkeles = (2 + (skillLvl/3));
        // PercentLife is multiplicative with lifeAura Values:
        multiplierLife = ((50 * skillLvl - 150)/100) * (1 + (lifeAuraTotal/100));
        // PercentDamage is additive with aura values:
        multiplierDamage = 1 + (((7 * skillLvl - 21)/100) + (damageAuraTotal/100));
    }

    // =============================================================[DAMAGE CALCULATION]
    var critChance = 0.05
    var critMultiplier = 2;
    var avgCritDamageIncrease = 1 + (critChance * critMultiplier);

    var minBaseDamage = 0;
    var maxBaseDamage = 0;
    var totalMinDamage;
    var totalMaxDamage;
    var totalAvgDamage;

    if (skillLvl <= 8 && skillLvl >= 1) {
        minBaseDamage = 1 + (2 * mSkillLvl);
        maxBaseDamage = 2 + (2 * mSkillLvl);
    } else if (skillLvl <= 16 && skillLvl >= 9) {
        minBaseDamage = (skillLvl - 7) + (2 * mSkillLvl);
        maxBaseDamage = (skillLvl - 6) + (2 * mSkillLvl);
    } else if (skillLvl <= 22 && skillLvl >= 17) {
        minBaseDamage = (skillLvl * 2 - 23) + (2 * mSkillLvl);
        maxBaseDamage = (skillLvl * 2 - 22) + (2 * mSkillLvl);
    } else if (skillLvl <= 28 && skillLvl >= 23) {
        minBaseDamage = (skillLvl * 3 - 45) + (2 * mSkillLvl);
        maxBaseDamage = (skillLvl * 3 - 44) + (2 * mSkillLvl);
    } else if (skillLvl <= 99 && skillLvl >= 28) {
        minBaseDamage = (skillLvl * 4 - 73) + (2 * mSkillLvl);
        maxBaseDamage = (skillLvl * 4 - 72) + (2 * mSkillLvl);
    }

    totalMinDamage = minBaseDamage * multiplierDamage * avgCritDamageIncrease;
    totalMaxDamage = maxBaseDamage * multiplierDamage * avgCritDamageIncrease;
    totalAvgDamage = (totalMinDamage + totalMaxDamage) / 2;

    // =============================================================[LIFE CALCULATION]
    var normalLife = (21 + (8 * mSkillLvl)) * multiplierLife;
    var nightmareLife = (30 + (8 * mSkillLvl)) * multiplierLife;
    var hellLife = (42 + (8 * mSkillLvl)) * multiplierLife;

    return {
        maximumSkeles,
        multiplierLife,
        multiplierDamage,
        totalMinDamage,
        totalMaxDamage,
        totalAvgDamage,
        normalLife,
        nightmareLife,
        hellLife
    };
}