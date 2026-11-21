import {
	getBankAccounts,
	getDonationTargets,
	getDonationTiers,
	getSiteContent
} from '#lib/api/site';

/** Cuentas bancarias, perritos, tiers de donación y texto "sobre nosotros". */
export async function load() {
	const [targets, accounts, content, tiers] = await Promise.all([
		getDonationTargets(),
		getBankAccounts(),
		getSiteContent(),
		getDonationTiers()
	]);

	return {
		// La página trabaja con los perritos, no con la envoltura de la meta.
		dogs: targets.map((target) => target.dog),
		accounts,
		aboutBlurb: content.aboutBlurb,
		tiers
	};
}