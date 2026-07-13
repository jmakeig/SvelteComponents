import type { Customer, Event, ID, Workload } from '$lib/entities';
import ufuzzy from '@leeoniya/ufuzzy';

const EVENTS: Array<Event> = [
	{
		event: 'a367c3ee-9c70-4096-a5b7-ba1e78a9b563' as ID,
		customer: {
			customer: '6b47e099-e412-4de5-a2c2-af570a5131a0' as ID,
			label: 'northwind_analytics',
			name: 'Northwind Analytics'
		},
		outcome: 'Quarterly check-in with Northwind Analytics. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: 'bc788a72-b391-45ca-b331-16c8ab92ae4c' as ID,
		customer: {
			customer: 'de77dd4e-fc4f-4bc6-a756-16e16f38a342' as ID,
			label: 'brightfield_logistics',
			name: 'Brightfield Logistics'
		},
		outcome: 'Quarterly check-in with Brightfield Logistics. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '1083bcbd-a528-45c7-84b3-41d7382b5866' as ID,
		customer: {
			customer: '87ea5331-5ee8-4b06-a07e-962206c5e559' as ID,
			label: 'cobalt_ridge_energy',
			name: 'Cobalt Ridge Energy'
		},
		outcome: 'Quarterly check-in with Cobalt Ridge Energy. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: 'cb81f911-a2b2-4023-90df-906b8adcbb20' as ID,
		customer: {
			customer: 'ab079df2-d638-43e7-9582-5460dd797492' as ID,
			label: 'verdant_foods_co',
			name: 'Verdant Foods Co'
		},
		outcome: 'Quarterly check-in with Verdant Foods Co. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: 'ff4b53c4-3ef6-4383-a792-5c5e91b4aaea' as ID,
		customer: {
			customer: '3e1b97cc-2b1f-4aaa-9d39-049f711364fd' as ID,
			label: 'halcyon_biotech',
			name: 'Halcyon Biotech'
		},
		outcome: 'Quarterly check-in with Halcyon Biotech. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: 'ea829367-e423-47b2-9ecb-38049783c52b' as ID,
		customer: {
			customer: '1e9ea0f7-10ff-4c77-9084-db5e3db289b1' as ID,
			label: 'ironclad_security_systems',
			name: 'Ironclad Security Systems'
		},
		outcome:
			'Quarterly check-in with Ironclad Security Systems. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: 'fe021cba-3294-487e-a553-3e250c5bcadd' as ID,
		customer: {
			customer: 'fcac0d47-6cc4-4236-9683-84e6ef4c2aae' as ID,
			label: 'lumen_optics_group',
			name: 'Lumen Optics Group'
		},
		outcome: 'Quarterly check-in with Lumen Optics Group. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: '6e28e661-e212-4ac1-abc1-3c6cb25bc731' as ID,
		customer: {
			customer: 'ff7d3b89-c653-460b-b1e9-7aef5d3ca901' as ID,
			label: 'sable_and_pine_furnishings',
			name: 'Sable & Pine Furnishings'
		},
		outcome:
			'Quarterly check-in with Sable & Pine Furnishings. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: 'd78d1c8a-cb88-401c-8cf6-8e7562a16a70' as ID,
		customer: {
			customer: '8435b315-502d-4733-b856-92f92813f5a5' as ID,
			label: 'quartzline_materials',
			name: 'Quartzline Materials'
		},
		outcome: 'Quarterly check-in with Quartzline Materials. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: '64f4eda5-a994-48b6-b6d3-8e7ed669b7ef' as ID,
		customer: {
			customer: '83ed2860-c066-43c6-a67d-7e6cb162743a' as ID,
			label: 'driftwood_media',
			name: 'Driftwood Media'
		},
		outcome: 'Quarterly check-in with Driftwood Media. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-13')
	},
	{
		event: '6bca4fa2-a1a2-4be4-a002-5aa733a8ca39' as ID,
		customer: {
			customer: '998e33c2-e657-4662-89fd-601025559ee7' as ID,
			label: 'pinnacle_freight_co',
			name: 'Pinnacle Freight Co'
		},
		outcome: 'Quarterly check-in with Pinnacle Freight Co. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-10')
	},
	{
		event: '310eb22c-0000-487b-a077-9024d16a8c5d' as ID,
		customer: {
			customer: '76b267b3-8308-473b-a4ec-d1bf2008e4b2' as ID,
			label: 'stonebridge_capital',
			name: 'Stonebridge Capital'
		},
		outcome: 'Quarterly check-in with Stonebridge Capital. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-07')
	},
	{
		event: 'd34cc525-c9f7-413a-b3b2-fd5be023f36b' as ID,
		customer: {
			customer: '70a9bcf0-c0cc-4f13-9c2e-f3642a3244b4' as ID,
			label: 'wrenfield_insurance',
			name: 'Wrenfield Insurance'
		},
		outcome: 'Quarterly check-in with Wrenfield Insurance. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-04')
	},
	{
		event: '9777c1f7-1f3f-4251-b483-af22707ea6ee' as ID,
		customer: {
			customer: 'c7a52c3c-e350-40a1-a8b7-e0957bf5eed3' as ID,
			label: 'tidewater_marine_supply',
			name: 'Tidewater Marine Supply'
		},
		outcome: 'Quarterly check-in with Tidewater Marine Supply. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-01')
	},
	{
		event: '46ff38a1-b153-4ccf-ac2d-81eb37818842' as ID,
		customer: {
			customer: 'b80ea7bc-49f7-4be0-b036-a5df1413831a' as ID,
			label: 'cascadia_renewables',
			name: 'Cascadia Renewables'
		},
		outcome: 'Quarterly check-in with Cascadia Renewables. Reviewed open items and next steps.',
		happened_at: new Date('2026-05-29')
	},
	{
		event: 'b6af5019-25e9-420e-83e5-ce53d151c817' as ID,
		customer: {
			customer: '07ea4829-acb3-4889-8db5-dc78fa7f13c6' as ID,
			label: 'granite_hollow_mining',
			name: 'Granite Hollow Mining'
		},
		outcome: 'Quarterly check-in with Granite Hollow Mining. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: '5610d27b-2bca-498f-a8fd-32b0cc26296e' as ID,
		customer: {
			customer: 'f037729b-be76-4d1c-960d-2c7d2ef12be4' as ID,
			label: 'birchwood_pharmaceuticals',
			name: 'Birchwood Pharmaceuticals'
		},
		outcome:
			'Quarterly check-in with Birchwood Pharmaceuticals. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '749d7f26-ae0e-4eb4-b60b-08c9c6f980b6' as ID,
		customer: {
			customer: 'bf53bdce-b1df-466f-9d90-135943c8cd5c' as ID,
			label: 'falcon_crest_aerospace',
			name: 'Falcon Crest Aerospace'
		},
		outcome: 'Quarterly check-in with Falcon Crest Aerospace. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: '999b9c9c-76e6-4606-b31e-b63288cd7974' as ID,
		customer: {
			customer: 'f9907b81-409c-446d-ab86-e23da463957b' as ID,
			label: 'marrow_and_co_design',
			name: 'Marrow & Co Design'
		},
		outcome: 'Quarterly check-in with Marrow & Co Design. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: 'f8b5af50-d6d2-4fb5-81ce-70ec5d78ffac' as ID,
		customer: {
			customer: '9cd111d8-df95-448e-a13e-f0f5cb5d9813' as ID,
			label: 'outpost_telecom',
			name: 'Outpost Telecom'
		},
		outcome: 'Quarterly check-in with Outpost Telecom. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: 'e6f8f17b-4b97-4b92-965d-a6da7151a950' as ID,
		customer: {
			customer: 'c3c67ade-5be8-4d3c-a670-b5c36abf84d4' as ID,
			label: 'redwood_civic_bank',
			name: 'Redwood Civic Bank'
		},
		outcome: 'Quarterly check-in with Redwood Civic Bank. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: '490b3cc2-29a4-48ea-8804-0d8c84b0e27a' as ID,
		customer: {
			customer: '2befdf55-17a7-4099-b717-c4ca9b5d99da' as ID,
			label: 'slate_harbor_shipping',
			name: 'Slate Harbor Shipping'
		},
		outcome: 'Quarterly check-in with Slate Harbor Shipping. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: '44ed7af8-20fc-4b97-b2a9-2f7d028f2bd5' as ID,
		customer: {
			customer: 'b975eee7-1063-42f1-8857-81befbde83a9' as ID,
			label: 'amberlight_studios',
			name: 'Amberlight Studios'
		},
		outcome: 'Quarterly check-in with Amberlight Studios. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: 'fd1f7d0e-d310-4c72-92da-c747612d232f' as ID,
		customer: {
			customer: '6ee6917b-afe2-4567-b551-4e46b6c3d26d' as ID,
			label: 'thistledown_apparel',
			name: 'Thistledown Apparel'
		},
		outcome: 'Quarterly check-in with Thistledown Apparel. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: 'd4e802cd-c764-447d-af82-e60e4cfb1b00' as ID,
		customer: {
			customer: 'bf5a4ace-1fed-4a73-ba17-464bbfa49467' as ID,
			label: 'vantage_point_consulting',
			name: 'Vantage Point Consulting'
		},
		outcome:
			'Quarterly check-in with Vantage Point Consulting. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-13')
	},
	{
		event: 'beca2f30-37e8-449b-9080-b7c60d729cca' as ID,
		customer: {
			customer: '0a8defbe-06e1-4619-b316-e10aeb2c8b65' as ID,
			label: 'copperline_manufacturing',
			name: 'Copperline Manufacturing'
		},
		outcome:
			'Quarterly check-in with Copperline Manufacturing. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-10')
	},
	{
		event: 'f92d15f2-4eea-4377-b040-3f59de6ff31b' as ID,
		customer: {
			customer: 'bfda9435-0a0f-451a-b2df-d091c09ad0a7' as ID,
			label: 'hearthstone_realty',
			name: 'Hearthstone Realty'
		},
		outcome: 'Quarterly check-in with Hearthstone Realty. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-07')
	},
	{
		event: 'ddabc56a-d816-437d-9d26-71f5ea3bef72' as ID,
		customer: {
			customer: 'f574ae96-e08a-4c4a-8020-a4bb78faf39b' as ID,
			label: 'nimbus_cloud_systems',
			name: 'Nimbus Cloud Systems'
		},
		outcome: 'Quarterly check-in with Nimbus Cloud Systems. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-04')
	},
	{
		event: '28e07254-45a7-4182-be5b-59c7cc644aa6' as ID,
		customer: {
			customer: 'fe682a0b-4aef-40af-b21e-120d50cb85bc' as ID,
			label: 'meridian_health_group',
			name: 'Meridian Health Group'
		},
		outcome: 'Quarterly check-in with Meridian Health Group. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-01')
	},
	{
		event: 'e8421b98-dfdc-4101-a47b-c2e117b585c2' as ID,
		customer: {
			customer: 'a9f3d49c-ad7c-4864-a5a2-4900b102536f' as ID,
			label: 'foxglove_cosmetics',
			name: 'Foxglove Cosmetics'
		},
		outcome: 'Quarterly check-in with Foxglove Cosmetics. Reviewed open items and next steps.',
		happened_at: new Date('2026-05-29')
	},
	{
		event: '5b423d4d-0436-4369-b256-0d9775f6f594' as ID,
		customer: {
			customer: 'f8105a8f-d318-4993-a8e3-e4320e022af9' as ID,
			label: 'ledger_and_vine_accounting',
			name: 'Ledger & Vine Accounting'
		},
		outcome:
			'Quarterly check-in with Ledger & Vine Accounting. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: '1ba7724a-2732-451b-9a44-eda00912f854' as ID,
		customer: {
			customer: '83fc76c4-df45-4205-91a6-90fef01e3f0a' as ID,
			label: 'greywolf_defense_corp',
			name: 'Greywolf Defense Corp'
		},
		outcome: 'Quarterly check-in with Greywolf Defense Corp. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '43de9e4c-f634-4d9a-87b2-022f266c3f10' as ID,
		customer: {
			customer: 'ce5fa0a9-c5ad-4174-8da5-66739fb1a73e' as ID,
			label: 'saltmarsh_agriculture',
			name: 'Saltmarsh Agriculture'
		},
		outcome: 'Quarterly check-in with Saltmarsh Agriculture. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: '1346bc2b-cc73-4d1e-a82b-c450810896fa' as ID,
		customer: {
			customer: '6725a71b-1d99-4611-83e8-d7eb62569a37' as ID,
			label: 'brassbound_tools',
			name: 'Brassbound Tools'
		},
		outcome: 'Quarterly check-in with Brassbound Tools. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: 'a55d782a-a1f8-418f-9619-9df615e1e43d' as ID,
		customer: {
			customer: 'f51bc9bc-e8f2-43e2-a058-5d30d16db131' as ID,
			label: 'echo_valley_records',
			name: 'Echo Valley Records'
		},
		outcome: 'Quarterly check-in with Echo Valley Records. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: '494d358d-7df8-4032-865c-9873d957a720' as ID,
		customer: {
			customer: 'c1be0791-461a-4db3-8297-3a2a0b4b98d6' as ID,
			label: 'ferncrest_hospitality',
			name: 'Ferncrest Hospitality'
		},
		outcome: 'Quarterly check-in with Ferncrest Hospitality. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: '3ab3cca9-a811-4e6b-a159-ad0d2e28825e' as ID,
		customer: {
			customer: 'a4617176-4d81-44cd-ac1e-4f3353c75983' as ID,
			label: 'ironwood_construction',
			name: 'Ironwood Construction'
		},
		outcome: 'Quarterly check-in with Ironwood Construction. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: '410c16ca-2304-4ceb-9d54-43a160adc875' as ID,
		customer: {
			customer: '6482c3ab-ab0f-47b8-8512-6d3bee054feb' as ID,
			label: 'driftline_apparel_co',
			name: 'Driftline Apparel Co'
		},
		outcome: 'Quarterly check-in with Driftline Apparel Co. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: '5358a205-0625-4533-bc14-e58e07c221fa' as ID,
		customer: {
			customer: 'e3c36155-777c-4943-982a-b0b50350099c' as ID,
			label: 'cinderpeak_robotics',
			name: 'Cinderpeak Robotics'
		},
		outcome: 'Quarterly check-in with Cinderpeak Robotics. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: 'e4b50189-a4ea-444f-b81c-683bae37bb58' as ID,
		customer: {
			customer: 'ed197597-79c8-48f2-89b7-f3eb6328d17e' as ID,
			label: 'wellspring_water_co',
			name: 'Wellspring Water Co'
		},
		outcome: 'Quarterly check-in with Wellspring Water Co. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-13')
	},
	{
		event: '054b76d5-64b1-43bc-aa9a-c96ce6ec6075' as ID,
		customer: {
			customer: 'c9a7f75f-f931-4f46-ae0b-53d88adeb31d' as ID,
			label: 'bramblewood_toys',
			name: 'Bramblewood Toys'
		},
		outcome: 'Quarterly check-in with Bramblewood Toys. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-10')
	},
	{
		event: 'cdd4066d-2322-4e8e-91b1-69ae508c811f' as ID,
		customer: {
			customer: 'd1593267-a60d-4143-aa19-4543bb6014b2' as ID,
			label: 'solstice_power_grid',
			name: 'Solstice Power Grid'
		},
		outcome: 'Quarterly check-in with Solstice Power Grid. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-07')
	},
	{
		event: '64935fc8-8e85-4701-9bb7-b880b3803171' as ID,
		customer: {
			customer: '86f06d5a-d17c-4a1e-bc37-6eaf38c0ae92' as ID,
			label: 'anchorpoint_logistics',
			name: 'Anchorpoint Logistics'
		},
		outcome: 'Quarterly check-in with Anchorpoint Logistics. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-04')
	},
	{
		event: '8d017fc6-67f4-49f6-8634-bd0c9006852e' as ID,
		customer: {
			customer: 'e66a7231-0881-4f16-ad13-1124a4975881' as ID,
			label: 'mosswood_publishing',
			name: 'Mosswood Publishing'
		},
		outcome: 'Quarterly check-in with Mosswood Publishing. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-01')
	},
	{
		event: '4cc15473-3478-43dd-89a4-02405b6389fe' as ID,
		customer: {
			customer: '18a5547f-171d-45ba-9e11-5508ffca30e3' as ID,
			label: 'vault_and_key_cybersecurity',
			name: 'Vault & Key Cybersecurity'
		},
		outcome:
			'Quarterly check-in with Vault & Key Cybersecurity. Reviewed open items and next steps.',
		happened_at: new Date('2026-05-29')
	},
	{
		event: 'fe06eb56-bcb2-47ec-8f11-e67719bd87dc' as ID,
		customer: {
			customer: '25f529a0-c2f1-4f91-96c1-92fa9e5db79f' as ID,
			label: 'highmark_furniture_co',
			name: 'Highmark Furniture Co'
		},
		outcome: 'Quarterly check-in with Highmark Furniture Co. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: '5677f885-1e07-4095-b9ff-a5cc1c08dedb' as ID,
		customer: {
			customer: 'a0082bce-82e0-42db-b0ba-16697c77c55d' as ID,
			label: 'lanternfish_seafood',
			name: 'Lanternfish Seafood'
		},
		outcome: 'Quarterly check-in with Lanternfish Seafood. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '3b968640-48f4-4601-8326-9ebff9a3795e' as ID,
		customer: {
			customer: '71251deb-6d98-41a6-8d3f-3ee395c41a78' as ID,
			label: 'crestline_motors',
			name: 'Crestline Motors'
		},
		outcome: 'Quarterly check-in with Crestline Motors. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: '033313d7-f4b6-46ce-91e4-6e0b6932ddbf' as ID,
		customer: {
			customer: '7531b415-ca8f-4541-bc5c-effd892935ad' as ID,
			label: 'pinegrove_timber_co',
			name: 'Pinegrove Timber Co'
		},
		outcome: 'Quarterly check-in with Pinegrove Timber Co. Reviewed open items and next steps.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: '2fe66f10-8ae4-4586-802f-c9ade3c5cc68' as ID,
		customer: {
			customer: '921b1085-8a48-4fce-b9fe-f2a0fc75905f' as ID,
			label: 'aldergate_pharmaceuticals',
			name: 'Aldergate Pharmaceuticals'
		},
		outcome:
			'Quarterly check-in with Aldergate Pharmaceuticals. Reviewed open items and next steps.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: '14de0703-fa21-495f-a8c2-7626cb07b67b' as ID,
		workload: {
			workload: 'ad060232-8b52-4ada-b6b4-eb64f0a1c0e9' as ID,
			label: 'brightfield_logistics_customer_portal_redesign',
			name: 'Customer portal redesign'
		},
		outcome: 'Checked in on “Customer portal redesign” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: '1961b51c-1ab9-4a12-87ff-c71b2982f53d' as ID,
		workload: {
			workload: '86114daf-5d32-4509-a69d-fb9bba43be92' as ID,
			label: 'verdant_foods_co_q3_supply_chain_audit',
			name: 'Q3 supply chain audit'
		},
		outcome: 'Checked in on “Q3 supply chain audit” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: '474f5977-3b57-4034-9210-cd4b244f231c' as ID,
		workload: {
			workload: '32e160bb-1822-4a0a-832a-6050c49f326d' as ID,
			label: 'halcyon_biotech_inventory_tracking_rollout',
			name: 'Inventory tracking rollout'
		},
		outcome: 'Checked in on “Inventory tracking rollout” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: 'cb29328f-1d1b-4ae9-8701-7626d1b883cc' as ID,
		workload: {
			workload: '431d0889-939c-4627-a44f-8dd10bc935bd' as ID,
			label: 'halcyon_biotech_mobile_app_v2_launch',
			name: 'Mobile app v2 launch'
		},
		outcome: 'Checked in on “Mobile app v2 launch” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: '62df598f-131c-4ce0-98d5-27ce2e4a976b' as ID,
		workload: {
			workload: '05fa343f-2216-4dd4-a491-c93fcbde7bf1' as ID,
			label: 'halcyon_biotech_data_warehouse_migration',
			name: 'Data warehouse migration'
		},
		outcome: 'Checked in on “Data warehouse migration” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-13')
	},
	{
		event: 'bfde7dcc-ad39-4667-93fd-0291eb5cae64' as ID,
		workload: {
			workload: 'edc90149-a0ea-4fc0-b845-5dec96582454' as ID,
			label: 'lumen_optics_group_carbon_footprint_initiative',
			name: 'Carbon footprint initiative'
		},
		outcome: 'Checked in on “Carbon footprint initiative” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-10')
	},
	{
		event: '6cd61dfc-55b7-477c-9f40-0c9c75be211a' as ID,
		workload: {
			workload: '30c7c30e-a2d7-41c7-bfda-14ea686229e3' as ID,
			label: 'lumen_optics_group_vendor_onboarding_overhaul',
			name: 'Vendor onboarding overhaul'
		},
		outcome: 'Checked in on “Vendor onboarding overhaul” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-07')
	},
	{
		event: '00a8cad2-99d0-4c02-8f6a-7b15bab29c73' as ID,
		workload: {
			workload: '04775c4d-cd5d-4983-a766-ce33048cdaa3' as ID,
			label: 'sable_and_pine_furnishings_fraud_detection_upgrade',
			name: 'Fraud detection upgrade'
		},
		outcome: 'Checked in on “Fraud detection upgrade” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-04')
	},
	{
		event: 'df0eb612-f184-457d-9826-dd39dbbf30bc' as ID,
		workload: {
			workload: '0a85062c-759c-435a-9d0f-55a2af90fe61' as ID,
			label: 'sable_and_pine_furnishings_employee_wellness_program',
			name: 'Employee wellness program'
		},
		outcome: 'Checked in on “Employee wellness program” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-01')
	},
	{
		event: 'a3240a3d-f7dd-4917-be41-a159d9ccb431' as ID,
		workload: {
			workload: '98e677d7-5b01-4082-b9e3-44de13ad5d11' as ID,
			label: 'stonebridge_capital_regional_expansion_study',
			name: 'Regional expansion study'
		},
		outcome: 'Checked in on “Regional expansion study” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-05-29')
	},
	{
		event: '4ac6acb5-e95b-4a8d-8dff-e88a90ab92b1' as ID,
		workload: {
			workload: 'fd18edac-c447-4ccf-8d83-b0b90bdc316e' as ID,
			label: 'stonebridge_capital_api_gateway_modernization',
			name: 'API gateway modernization'
		},
		outcome: 'Checked in on “API gateway modernization” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: '8f913569-60b9-4241-b9b1-04f00e9c6ae9' as ID,
		workload: {
			workload: '830132ac-0111-4d4d-be91-85570edb6258' as ID,
			label: 'cascadia_renewables_payroll_system_migration',
			name: 'Payroll system migration'
		},
		outcome: 'Checked in on “Payroll system migration” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '49a97115-6484-440e-8c50-80c07a44155c' as ID,
		workload: {
			workload: 'a14ccdeb-4129-441d-851b-1ab83e9867de' as ID,
			label: 'birchwood_pharmaceuticals_brand_refresh_campaign',
			name: 'Brand refresh campaign'
		},
		outcome: 'Checked in on “Brand refresh campaign” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: '1870964c-94a5-4ea1-8a72-727ed716757e' as ID,
		workload: {
			workload: 'a0311e56-0abe-44e0-87ac-668ebe81507a' as ID,
			label: 'falcon_crest_aerospace_cold_storage_expansion',
			name: 'Cold storage expansion'
		},
		outcome: 'Checked in on “Cold storage expansion” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: 'af7bebb9-318e-4ec6-b521-f9c3c3e94af1' as ID,
		workload: {
			workload: '7d39ecc6-c5fd-4527-8c81-64e3d9b69405' as ID,
			label: 'falcon_crest_aerospace_predictive_maintenance_pilot',
			name: 'Predictive maintenance pilot'
		},
		outcome:
			'Checked in on “Predictive maintenance pilot” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: '5c680972-05a0-4e17-9cae-9e26377106c4' as ID,
		workload: {
			workload: '29b98a62-095f-4c46-9146-e0c43e58fb82' as ID,
			label: 'outpost_telecom_customer_loyalty_platform',
			name: 'Customer loyalty platform'
		},
		outcome: 'Checked in on “Customer loyalty platform” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: 'ff4ab67e-da96-497b-9931-15b9986b7bf3' as ID,
		workload: {
			workload: '5c040725-82ba-4ba4-aa6d-ec8a9750c3a0' as ID,
			label: 'redwood_civic_bank_internal_tooling_consolidation',
			name: 'Internal tooling consolidation'
		},
		outcome:
			'Checked in on “Internal tooling consolidation” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: 'c074860b-b4c6-4de0-ae6d-5a66b97f3079' as ID,
		workload: {
			workload: 'ca040012-9717-4306-bf20-e937de26c9ba' as ID,
			label: 'redwood_civic_bank_cybersecurity_hardening_sprint',
			name: 'Cybersecurity hardening sprint'
		},
		outcome:
			'Checked in on “Cybersecurity hardening sprint” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: '0e9d5ced-3619-4125-9698-aeac011e0754' as ID,
		workload: {
			workload: 'f8c91d36-c111-420f-9a5f-88eb0b6b115d' as ID,
			label: 'redwood_civic_bank_sustainability_reporting_tool',
			name: 'Sustainability reporting tool'
		},
		outcome:
			'Checked in on “Sustainability reporting tool” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: '5a8e3af5-5118-403e-adf6-cec360873bde' as ID,
		workload: {
			workload: 'fd17e0c4-2a81-460a-85dd-118ed3e472b0' as ID,
			label: 'amberlight_studios_warehouse_automation_pilot',
			name: 'Warehouse automation pilot'
		},
		outcome: 'Checked in on “Warehouse automation pilot” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-13')
	},
	{
		event: '418ae844-7ab1-4c07-b842-97f6d8db965c' as ID,
		workload: {
			workload: '023c289c-9fa2-4a3c-861d-fdd064558cb7' as ID,
			label: 'amberlight_studios_pricing_model_overhaul',
			name: 'Pricing model overhaul'
		},
		outcome: 'Checked in on “Pricing model overhaul” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-10')
	},
	{
		event: 'e8e753da-e0c1-48c5-9d3a-54094eff0283' as ID,
		workload: {
			workload: '7f47bfa0-1955-47da-a8a0-ab6633acd21c' as ID,
			label: 'thistledown_apparel_talent_acquisition_platform',
			name: 'Talent acquisition platform'
		},
		outcome: 'Checked in on “Talent acquisition platform” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-07')
	},
	{
		event: 'ab372f7b-05b3-4c33-8d1d-c90f718176c5' as ID,
		workload: {
			workload: 'fe6ac4f6-2158-47fa-ac42-b6d56d009b6e' as ID,
			label: 'thistledown_apparel_cloud_cost_optimization',
			name: 'Cloud cost optimization'
		},
		outcome: 'Checked in on “Cloud cost optimization” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-04')
	},
	{
		event: '667871d9-0771-4045-a7d0-bcff9b06f559' as ID,
		workload: {
			workload: '4ae71911-fb39-4f4f-93ef-5805ee885ebe' as ID,
			label: 'thistledown_apparel_field_service_app_rebuild',
			name: 'Field service app rebuild'
		},
		outcome: 'Checked in on “Field service app rebuild” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-01')
	},
	{
		event: 'e587e6eb-2de1-4a75-9006-84de3e9deda9' as ID,
		workload: {
			workload: 'd98fa71f-0637-4a53-994c-1f87f9fd07ee' as ID,
			label: 'vantage_point_consulting_compliance_documentation_push',
			name: 'Compliance documentation push'
		},
		outcome:
			'Checked in on “Compliance documentation push” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-05-29')
	},
	{
		event: '4a941301-1465-4ffe-bb6d-0eb06772679c' as ID,
		workload: {
			workload: '3c07c83a-8857-4390-b1d9-bdf96e0d32fc' as ID,
			label: 'vantage_point_consulting_real_time_analytics_dashboard',
			name: 'Real-time analytics dashboard'
		},
		outcome:
			'Checked in on “Real-time analytics dashboard” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: '10280836-f4c6-4893-861b-fc38d6455a1c' as ID,
		workload: {
			workload: '672ea8eb-9233-4af0-9265-e007e2aaf04b' as ID,
			label: 'nimbus_cloud_systems_legacy_system_decommission',
			name: 'Legacy system decommission'
		},
		outcome: 'Checked in on “Legacy system decommission” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '8026e6b4-1b88-4a31-986a-883cfcbd502b' as ID,
		workload: {
			workload: '3f4d4571-02bf-48a6-9bf5-8e8cc44449ca' as ID,
			label: 'meridian_health_group_multi_region_failover_setup',
			name: 'Multi-region failover setup'
		},
		outcome: 'Checked in on “Multi-region failover setup” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: '5153880e-99f4-4036-a122-dfd7df247bed' as ID,
		workload: {
			workload: '3e4e9f10-4dff-4766-a494-022fa210e748' as ID,
			label: 'meridian_health_group_subscription_billing_revamp',
			name: 'Subscription billing revamp'
		},
		outcome: 'Checked in on “Subscription billing revamp” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: '6c984140-6318-48e4-a53b-947c773e62e6' as ID,
		workload: {
			workload: 'e4b2d68b-c024-4ac5-be24-7dd7af5819a4' as ID,
			label: 'meridian_health_group_partner_integration_program',
			name: 'Partner integration program'
		},
		outcome: 'Checked in on “Partner integration program” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: '6374f63d-7cbe-463c-a0f1-63a2c9157973' as ID,
		workload: {
			workload: '136d7ea6-2499-41d0-89cb-b42d46e516d1' as ID,
			label: 'foxglove_cosmetics_accessibility_compliance_audit',
			name: 'Accessibility compliance audit'
		},
		outcome:
			'Checked in on “Accessibility compliance audit” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: '6a96afb5-9c0b-401c-8d99-d6716cce3eb3' as ID,
		workload: {
			workload: 'e1184883-ae1d-4101-992d-ed1fc28d0a87' as ID,
			label: 'foxglove_cosmetics_voice_of_customer_research',
			name: 'Voice-of-customer research'
		},
		outcome: 'Checked in on “Voice-of-customer research” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: 'f4b8d41b-31fa-4889-89d8-90d8ab8f8c87' as ID,
		workload: {
			workload: 'b136a075-c13d-4acc-9766-86bccd7c454e' as ID,
			label: 'ledger_and_vine_accounting_supply_forecasting_model',
			name: 'Supply forecasting model'
		},
		outcome: 'Checked in on “Supply forecasting model” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: '7cbf7744-bf43-40a4-b093-4649fc38431b' as ID,
		workload: {
			workload: 'd2bf8d94-c8c1-47aa-9171-9a39a332165e' as ID,
			label: 'ledger_and_vine_accounting_data_privacy_remediation',
			name: 'Data privacy remediation'
		},
		outcome: 'Checked in on “Data privacy remediation” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: '3d540e3c-488e-498b-9176-c0fe069249aa' as ID,
		workload: {
			workload: '94b64800-9de5-4e79-8f9c-c5cb58be448e' as ID,
			label: 'greywolf_defense_corp_onboarding_flow_simplification',
			name: 'Onboarding flow simplification'
		},
		outcome:
			'Checked in on “Onboarding flow simplification” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-13')
	},
	{
		event: '8705bcce-8c7f-4896-baaf-99677075a069' as ID,
		workload: {
			workload: '3f5c4cc9-3c7d-470e-9253-1e7e451c0827' as ID,
			label: 'saltmarsh_agriculture_energy_efficiency_retrofit',
			name: 'Energy efficiency retrofit'
		},
		outcome: 'Checked in on “Energy efficiency retrofit” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-10')
	},
	{
		event: '18fb5079-a88e-45a7-acc7-86e01d5d3304' as ID,
		workload: {
			workload: 'ebdff0c2-05a0-49eb-a34b-bf13a57599eb' as ID,
			label: 'saltmarsh_agriculture_retail_pos_upgrade',
			name: 'Retail POS upgrade'
		},
		outcome: 'Checked in on “Retail POS upgrade” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-07')
	},
	{
		event: '9ecc4a26-4f8b-48e5-adea-2e8ccb7565d9' as ID,
		workload: {
			workload: 'b7f9c571-871d-4aff-ac5c-984f1c2ee79d' as ID,
			label: 'saltmarsh_agriculture_knowledge_base_consolidation',
			name: 'Knowledge base consolidation'
		},
		outcome:
			'Checked in on “Knowledge base consolidation” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-04')
	},
	{
		event: '0d1c6ac8-ee4e-47bf-a3cb-cecd4c1a7758' as ID,
		workload: {
			workload: '15eed817-5d89-4b44-aeee-7aa9ec508496' as ID,
			label: 'ironwood_construction_quality_assurance_automation',
			name: 'Quality assurance automation'
		},
		outcome:
			'Checked in on “Quality assurance automation” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-01')
	},
	{
		event: 'd26f3b70-791b-4436-8200-ac9177c58def' as ID,
		workload: {
			workload: 'd66b1104-3711-46c2-958f-6ea6d84a2fd7' as ID,
			label: 'driftline_apparel_co_international_tax_compliance',
			name: 'International tax compliance'
		},
		outcome:
			'Checked in on “International tax compliance” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-05-29')
	},
	{
		event: '6e6a46e2-ba75-4034-a075-d58f38233530' as ID,
		workload: {
			workload: '7afa7cd3-7ae8-44c9-b4a3-475de4403d97' as ID,
			label: 'cinderpeak_robotics_customer_churn_analysis',
			name: 'Customer churn analysis'
		},
		outcome: 'Checked in on “Customer churn analysis” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-10')
	},
	{
		event: 'e87aff4f-f471-4bb3-a665-37e43b3c184a' as ID,
		workload: {
			workload: '306e9e86-ad07-4a78-9e0c-7c4670c743bd' as ID,
			label: 'cinderpeak_robotics_fleet_electrification_pilot',
			name: 'Fleet electrification pilot'
		},
		outcome: 'Checked in on “Fleet electrification pilot” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-07')
	},
	{
		event: '85dc397f-ecc6-487d-86d8-58e73ea93b6b' as ID,
		workload: {
			workload: 'a3f6c813-a715-461b-9c2f-3c9c07782e27' as ID,
			label: 'mosswood_publishing_document_management_overhaul',
			name: 'Document management overhaul'
		},
		outcome:
			'Checked in on “Document management overhaul” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-04')
	},
	{
		event: '899df8f7-e750-4d5d-b354-12eb986054b1' as ID,
		workload: {
			workload: '8e7034e4-78a7-44c3-a05d-73dc4c6e7f9d' as ID,
			label: 'vault_and_key_cybersecurity_site_reliability_initiative',
			name: 'Site reliability initiative'
		},
		outcome: 'Checked in on “Site reliability initiative” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-07-01')
	},
	{
		event: 'd3d71e1d-581a-4e06-aafa-0c835070538f' as ID,
		workload: {
			workload: 'dd4233b5-492d-41c4-86a9-b79569f37f89' as ID,
			label: 'highmark_furniture_co_marketing_attribution_model',
			name: 'Marketing attribution model'
		},
		outcome: 'Checked in on “Marketing attribution model” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-28')
	},
	{
		event: '4250dbd6-ff33-46d5-9ee1-551ff3f39d95' as ID,
		workload: {
			workload: 'c311f2ea-f678-4214-bc8c-16c0c2cf4254' as ID,
			label: 'lanternfish_seafood_procurement_platform_rebuild',
			name: 'Procurement platform rebuild'
		},
		outcome:
			'Checked in on “Procurement platform rebuild” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-25')
	},
	{
		event: '4b5c2728-0ec2-4dbd-9b86-fd73297612e5' as ID,
		workload: {
			workload: '05c032f9-f994-4e89-876e-6862a5a64323' as ID,
			label: 'crestline_motors_workforce_scheduling_system',
			name: 'Workforce scheduling system'
		},
		outcome: 'Checked in on “Workforce scheduling system” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-22')
	},
	{
		event: '8b373e69-6d81-40fb-82e5-c8d4919819e1' as ID,
		workload: {
			workload: 'a3bcd48f-dc02-44a7-9bba-86099eb063ed' as ID,
			label: 'crestline_motors_product_catalog_migration',
			name: 'Product catalog migration'
		},
		outcome: 'Checked in on “Product catalog migration” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-19')
	},
	{
		event: 'e15b9ba1-c09b-4669-bf75-0aabd8447697' as ID,
		workload: {
			workload: 'd5a7174b-2ea5-4afc-89dc-92a8fe1e1728' as ID,
			label: 'pinegrove_timber_co_disaster_recovery_drill_program',
			name: 'Disaster recovery drill program'
		},
		outcome:
			'Checked in on “Disaster recovery drill program” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-16')
	},
	{
		event: 'fc2b516e-b6a4-4ac2-aae4-8db314ab07bf' as ID,
		workload: {
			workload: 'f2c02e19-4d4f-46c3-8ce5-0d6d4b5d3c0c' as ID,
			label: 'aldergate_pharmaceuticals_network_infrastructure_refresh',
			name: 'Network infrastructure refresh'
		},
		outcome:
			'Checked in on “Network infrastructure refresh” — status reviewed and next steps agreed.',
		happened_at: new Date('2026-06-13')
	}
];

const CUSTOMERS: Array<Customer> = [
	{
		customer: '6b47e099-e412-4de5-a2c2-af570a5131a0' as ID,
		label: 'northwind_analytics',
		name: 'Northwind Analytics',
		segment: 'select'
	},
	{
		customer: 'de77dd4e-fc4f-4bc6-a756-16e16f38a342' as ID,
		label: 'brightfield_logistics',
		name: 'Brightfield Logistics',
		segment: 'enterprise'
	},
	{
		customer: '87ea5331-5ee8-4b06-a07e-962206c5e559' as ID,
		label: 'cobalt_ridge_energy',
		name: 'Cobalt Ridge Energy',
		segment: 'corporate'
	},
	{
		customer: 'ab079df2-d638-43e7-9582-5460dd797492' as ID,
		label: 'verdant_foods_co',
		name: 'Verdant Foods Co',
		segment: 'smb'
	},
	{
		customer: '3e1b97cc-2b1f-4aaa-9d39-049f711364fd' as ID,
		label: 'halcyon_biotech',
		name: 'Halcyon Biotech',
		segment: 'select'
	},
	{
		customer: '1e9ea0f7-10ff-4c77-9084-db5e3db289b1' as ID,
		label: 'ironclad_security_systems',
		name: 'Ironclad Security Systems',
		segment: 'enterprise'
	},
	{
		customer: 'fcac0d47-6cc4-4236-9683-84e6ef4c2aae' as ID,
		label: 'lumen_optics_group',
		name: 'Lumen Optics Group',
		segment: 'corporate'
	},
	{
		customer: 'ff7d3b89-c653-460b-b1e9-7aef5d3ca901' as ID,
		label: 'sable_and_pine_furnishings',
		name: 'Sable & Pine Furnishings',
		segment: 'smb'
	},
	{
		customer: '8435b315-502d-4733-b856-92f92813f5a5' as ID,
		label: 'quartzline_materials',
		name: 'Quartzline Materials',
		segment: 'select'
	},
	{
		customer: '83ed2860-c066-43c6-a67d-7e6cb162743a' as ID,
		label: 'driftwood_media',
		name: 'Driftwood Media',
		segment: 'enterprise'
	},
	{
		customer: '998e33c2-e657-4662-89fd-601025559ee7' as ID,
		label: 'pinnacle_freight_co',
		name: 'Pinnacle Freight Co',
		segment: 'corporate'
	},
	{
		customer: '76b267b3-8308-473b-a4ec-d1bf2008e4b2' as ID,
		label: 'stonebridge_capital',
		name: 'Stonebridge Capital',
		segment: 'smb'
	},
	{
		customer: '70a9bcf0-c0cc-4f13-9c2e-f3642a3244b4' as ID,
		label: 'wrenfield_insurance',
		name: 'Wrenfield Insurance',
		segment: 'select'
	},
	{
		customer: 'c7a52c3c-e350-40a1-a8b7-e0957bf5eed3' as ID,
		label: 'tidewater_marine_supply',
		name: 'Tidewater Marine Supply',
		segment: 'enterprise'
	},
	{
		customer: 'b80ea7bc-49f7-4be0-b036-a5df1413831a' as ID,
		label: 'cascadia_renewables',
		name: 'Cascadia Renewables',
		segment: 'corporate'
	},
	{
		customer: '07ea4829-acb3-4889-8db5-dc78fa7f13c6' as ID,
		label: 'granite_hollow_mining',
		name: 'Granite Hollow Mining',
		segment: 'smb'
	},
	{
		customer: 'f037729b-be76-4d1c-960d-2c7d2ef12be4' as ID,
		label: 'birchwood_pharmaceuticals',
		name: 'Birchwood Pharmaceuticals',
		segment: 'select'
	},
	{
		customer: 'bf53bdce-b1df-466f-9d90-135943c8cd5c' as ID,
		label: 'falcon_crest_aerospace',
		name: 'Falcon Crest Aerospace',
		segment: 'enterprise'
	},
	{
		customer: 'f9907b81-409c-446d-ab86-e23da463957b' as ID,
		label: 'marrow_and_co_design',
		name: 'Marrow & Co Design',
		segment: 'corporate'
	},
	{
		customer: '9cd111d8-df95-448e-a13e-f0f5cb5d9813' as ID,
		label: 'outpost_telecom',
		name: 'Outpost Telecom',
		segment: 'smb'
	},
	{
		customer: 'c3c67ade-5be8-4d3c-a670-b5c36abf84d4' as ID,
		label: 'redwood_civic_bank',
		name: 'Redwood Civic Bank',
		segment: 'select'
	},
	{
		customer: '2befdf55-17a7-4099-b717-c4ca9b5d99da' as ID,
		label: 'slate_harbor_shipping',
		name: 'Slate Harbor Shipping',
		segment: 'enterprise'
	},
	{
		customer: 'b975eee7-1063-42f1-8857-81befbde83a9' as ID,
		label: 'amberlight_studios',
		name: 'Amberlight Studios',
		segment: 'corporate'
	},
	{
		customer: '6ee6917b-afe2-4567-b551-4e46b6c3d26d' as ID,
		label: 'thistledown_apparel',
		name: 'Thistledown Apparel',
		segment: 'smb'
	},
	{
		customer: 'bf5a4ace-1fed-4a73-ba17-464bbfa49467' as ID,
		label: 'vantage_point_consulting',
		name: 'Vantage Point Consulting',
		segment: 'select'
	},
	{
		customer: '0a8defbe-06e1-4619-b316-e10aeb2c8b65' as ID,
		label: 'copperline_manufacturing',
		name: 'Copperline Manufacturing',
		segment: 'enterprise'
	},
	{
		customer: 'bfda9435-0a0f-451a-b2df-d091c09ad0a7' as ID,
		label: 'hearthstone_realty',
		name: 'Hearthstone Realty',
		segment: 'corporate'
	},
	{
		customer: 'f574ae96-e08a-4c4a-8020-a4bb78faf39b' as ID,
		label: 'nimbus_cloud_systems',
		name: 'Nimbus Cloud Systems',
		segment: 'smb'
	},
	{
		customer: 'fe682a0b-4aef-40af-b21e-120d50cb85bc' as ID,
		label: 'meridian_health_group',
		name: 'Meridian Health Group',
		segment: 'select'
	},
	{
		customer: 'a9f3d49c-ad7c-4864-a5a2-4900b102536f' as ID,
		label: 'foxglove_cosmetics',
		name: 'Foxglove Cosmetics',
		segment: 'enterprise'
	},
	{
		customer: 'f8105a8f-d318-4993-a8e3-e4320e022af9' as ID,
		label: 'ledger_and_vine_accounting',
		name: 'Ledger & Vine Accounting',
		segment: 'corporate'
	},
	{
		customer: '83fc76c4-df45-4205-91a6-90fef01e3f0a' as ID,
		label: 'greywolf_defense_corp',
		name: 'Greywolf Defense Corp',
		segment: 'smb'
	},
	{
		customer: 'ce5fa0a9-c5ad-4174-8da5-66739fb1a73e' as ID,
		label: 'saltmarsh_agriculture',
		name: 'Saltmarsh Agriculture',
		segment: 'select'
	},
	{
		customer: '6725a71b-1d99-4611-83e8-d7eb62569a37' as ID,
		label: 'brassbound_tools',
		name: 'Brassbound Tools',
		segment: 'enterprise'
	},
	{
		customer: 'f51bc9bc-e8f2-43e2-a058-5d30d16db131' as ID,
		label: 'echo_valley_records',
		name: 'Echo Valley Records',
		segment: 'corporate'
	},
	{
		customer: 'c1be0791-461a-4db3-8297-3a2a0b4b98d6' as ID,
		label: 'ferncrest_hospitality',
		name: 'Ferncrest Hospitality',
		segment: 'smb'
	},
	{
		customer: 'a4617176-4d81-44cd-ac1e-4f3353c75983' as ID,
		label: 'ironwood_construction',
		name: 'Ironwood Construction',
		segment: 'select'
	},
	{
		customer: '6482c3ab-ab0f-47b8-8512-6d3bee054feb' as ID,
		label: 'driftline_apparel_co',
		name: 'Driftline Apparel Co',
		segment: 'enterprise'
	},
	{
		customer: 'e3c36155-777c-4943-982a-b0b50350099c' as ID,
		label: 'cinderpeak_robotics',
		name: 'Cinderpeak Robotics',
		segment: 'corporate'
	},
	{
		customer: 'ed197597-79c8-48f2-89b7-f3eb6328d17e' as ID,
		label: 'wellspring_water_co',
		name: 'Wellspring Water Co',
		segment: 'smb'
	},
	{
		customer: 'c9a7f75f-f931-4f46-ae0b-53d88adeb31d' as ID,
		label: 'bramblewood_toys',
		name: 'Bramblewood Toys',
		segment: 'select'
	},
	{
		customer: 'd1593267-a60d-4143-aa19-4543bb6014b2' as ID,
		label: 'solstice_power_grid',
		name: 'Solstice Power Grid',
		segment: 'enterprise'
	},
	{
		customer: '86f06d5a-d17c-4a1e-bc37-6eaf38c0ae92' as ID,
		label: 'anchorpoint_logistics',
		name: 'Anchorpoint Logistics',
		segment: 'corporate'
	},
	{
		customer: 'e66a7231-0881-4f16-ad13-1124a4975881' as ID,
		label: 'mosswood_publishing',
		name: 'Mosswood Publishing',
		segment: 'smb'
	},
	{
		customer: '18a5547f-171d-45ba-9e11-5508ffca30e3' as ID,
		label: 'vault_and_key_cybersecurity',
		name: 'Vault & Key Cybersecurity',
		segment: 'select'
	},
	{
		customer: '25f529a0-c2f1-4f91-96c1-92fa9e5db79f' as ID,
		label: 'highmark_furniture_co',
		name: 'Highmark Furniture Co',
		segment: 'enterprise'
	},
	{
		customer: 'a0082bce-82e0-42db-b0ba-16697c77c55d' as ID,
		label: 'lanternfish_seafood',
		name: 'Lanternfish Seafood',
		segment: 'corporate'
	},
	{
		customer: '71251deb-6d98-41a6-8d3f-3ee395c41a78' as ID,
		label: 'crestline_motors',
		name: 'Crestline Motors',
		segment: 'smb'
	},
	{
		customer: '7531b415-ca8f-4541-bc5c-effd892935ad' as ID,
		label: 'pinegrove_timber_co',
		name: 'Pinegrove Timber Co',
		segment: 'select'
	},
	{
		customer: '921b1085-8a48-4fce-b9fe-f2a0fc75905f' as ID,
		label: 'aldergate_pharmaceuticals',
		name: 'Aldergate Pharmaceuticals',
		segment: 'enterprise'
	}
];

const WORKLOADS: Array<Workload> = [
	{
		workload: 'ad060232-8b52-4ada-b6b4-eb64f0a1c0e9' as ID,
		label: 'brightfield_logistics_customer_portal_redesign',
		name: 'Customer portal redesign',
		size: 4
	},
	{
		workload: '86114daf-5d32-4509-a69d-fb9bba43be92' as ID,
		label: 'verdant_foods_co_q3_supply_chain_audit',
		name: 'Q3 supply chain audit',
		size: 7
	},
	{
		workload: '32e160bb-1822-4a0a-832a-6050c49f326d' as ID,
		label: 'halcyon_biotech_inventory_tracking_rollout',
		name: 'Inventory tracking rollout',
		size: 10
	},
	{
		workload: '431d0889-939c-4627-a44f-8dd10bc935bd' as ID,
		label: 'halcyon_biotech_mobile_app_v2_launch',
		name: 'Mobile app v2 launch',
		size: 13
	},
	{
		workload: '05fa343f-2216-4dd4-a491-c93fcbde7bf1' as ID,
		label: 'halcyon_biotech_data_warehouse_migration',
		name: 'Data warehouse migration',
		size: 16
	},
	{
		workload: 'edc90149-a0ea-4fc0-b845-5dec96582454' as ID,
		label: 'lumen_optics_group_carbon_footprint_initiative',
		name: 'Carbon footprint initiative',
		size: 19
	},
	{
		workload: '30c7c30e-a2d7-41c7-bfda-14ea686229e3' as ID,
		label: 'lumen_optics_group_vendor_onboarding_overhaul',
		name: 'Vendor onboarding overhaul',
		size: 2
	},
	{
		workload: '04775c4d-cd5d-4983-a766-ce33048cdaa3' as ID,
		label: 'sable_and_pine_furnishings_fraud_detection_upgrade',
		name: 'Fraud detection upgrade',
		size: 5
	},
	{
		workload: '0a85062c-759c-435a-9d0f-55a2af90fe61' as ID,
		label: 'sable_and_pine_furnishings_employee_wellness_program',
		name: 'Employee wellness program',
		size: 8
	},
	{
		workload: '98e677d7-5b01-4082-b9e3-44de13ad5d11' as ID,
		label: 'stonebridge_capital_regional_expansion_study',
		name: 'Regional expansion study',
		size: 11
	},
	{
		workload: 'fd18edac-c447-4ccf-8d83-b0b90bdc316e' as ID,
		label: 'stonebridge_capital_api_gateway_modernization',
		name: 'API gateway modernization',
		size: 14
	},
	{
		workload: '830132ac-0111-4d4d-be91-85570edb6258' as ID,
		label: 'cascadia_renewables_payroll_system_migration',
		name: 'Payroll system migration',
		size: 17
	},
	{
		workload: 'a14ccdeb-4129-441d-851b-1ab83e9867de' as ID,
		label: 'birchwood_pharmaceuticals_brand_refresh_campaign',
		name: 'Brand refresh campaign',
		size: 20
	},
	{
		workload: 'a0311e56-0abe-44e0-87ac-668ebe81507a' as ID,
		label: 'falcon_crest_aerospace_cold_storage_expansion',
		name: 'Cold storage expansion',
		size: 3
	},
	{
		workload: '7d39ecc6-c5fd-4527-8c81-64e3d9b69405' as ID,
		label: 'falcon_crest_aerospace_predictive_maintenance_pilot',
		name: 'Predictive maintenance pilot',
		size: 6
	},
	{
		workload: '29b98a62-095f-4c46-9146-e0c43e58fb82' as ID,
		label: 'outpost_telecom_customer_loyalty_platform',
		name: 'Customer loyalty platform',
		size: 9
	},
	{
		workload: '5c040725-82ba-4ba4-aa6d-ec8a9750c3a0' as ID,
		label: 'redwood_civic_bank_internal_tooling_consolidation',
		name: 'Internal tooling consolidation',
		size: 12
	},
	{
		workload: 'ca040012-9717-4306-bf20-e937de26c9ba' as ID,
		label: 'redwood_civic_bank_cybersecurity_hardening_sprint',
		name: 'Cybersecurity hardening sprint',
		size: 15
	},
	{
		workload: 'f8c91d36-c111-420f-9a5f-88eb0b6b115d' as ID,
		label: 'redwood_civic_bank_sustainability_reporting_tool',
		name: 'Sustainability reporting tool',
		size: 18
	},
	{
		workload: 'fd17e0c4-2a81-460a-85dd-118ed3e472b0' as ID,
		label: 'amberlight_studios_warehouse_automation_pilot',
		name: 'Warehouse automation pilot',
		size: 21
	},
	{
		workload: '023c289c-9fa2-4a3c-861d-fdd064558cb7' as ID,
		label: 'amberlight_studios_pricing_model_overhaul',
		name: 'Pricing model overhaul',
		size: 4
	},
	{
		workload: '7f47bfa0-1955-47da-a8a0-ab6633acd21c' as ID,
		label: 'thistledown_apparel_talent_acquisition_platform',
		name: 'Talent acquisition platform',
		size: 7
	},
	{
		workload: 'fe6ac4f6-2158-47fa-ac42-b6d56d009b6e' as ID,
		label: 'thistledown_apparel_cloud_cost_optimization',
		name: 'Cloud cost optimization',
		size: 10
	},
	{
		workload: '4ae71911-fb39-4f4f-93ef-5805ee885ebe' as ID,
		label: 'thistledown_apparel_field_service_app_rebuild',
		name: 'Field service app rebuild',
		size: 13
	},
	{
		workload: 'd98fa71f-0637-4a53-994c-1f87f9fd07ee' as ID,
		label: 'vantage_point_consulting_compliance_documentation_push',
		name: 'Compliance documentation push',
		size: 16
	},
	{
		workload: '3c07c83a-8857-4390-b1d9-bdf96e0d32fc' as ID,
		label: 'vantage_point_consulting_real_time_analytics_dashboard',
		name: 'Real-time analytics dashboard',
		size: 19
	},
	{
		workload: '672ea8eb-9233-4af0-9265-e007e2aaf04b' as ID,
		label: 'nimbus_cloud_systems_legacy_system_decommission',
		name: 'Legacy system decommission',
		size: 2
	},
	{
		workload: '3f4d4571-02bf-48a6-9bf5-8e8cc44449ca' as ID,
		label: 'meridian_health_group_multi_region_failover_setup',
		name: 'Multi-region failover setup',
		size: 5
	},
	{
		workload: '3e4e9f10-4dff-4766-a494-022fa210e748' as ID,
		label: 'meridian_health_group_subscription_billing_revamp',
		name: 'Subscription billing revamp',
		size: 8
	},
	{
		workload: 'e4b2d68b-c024-4ac5-be24-7dd7af5819a4' as ID,
		label: 'meridian_health_group_partner_integration_program',
		name: 'Partner integration program',
		size: 11
	},
	{
		workload: '136d7ea6-2499-41d0-89cb-b42d46e516d1' as ID,
		label: 'foxglove_cosmetics_accessibility_compliance_audit',
		name: 'Accessibility compliance audit',
		size: 14
	},
	{
		workload: 'e1184883-ae1d-4101-992d-ed1fc28d0a87' as ID,
		label: 'foxglove_cosmetics_voice_of_customer_research',
		name: 'Voice-of-customer research',
		size: 17
	},
	{
		workload: 'b136a075-c13d-4acc-9766-86bccd7c454e' as ID,
		label: 'ledger_and_vine_accounting_supply_forecasting_model',
		name: 'Supply forecasting model',
		size: 20
	},
	{
		workload: 'd2bf8d94-c8c1-47aa-9171-9a39a332165e' as ID,
		label: 'ledger_and_vine_accounting_data_privacy_remediation',
		name: 'Data privacy remediation',
		size: 3
	},
	{
		workload: '94b64800-9de5-4e79-8f9c-c5cb58be448e' as ID,
		label: 'greywolf_defense_corp_onboarding_flow_simplification',
		name: 'Onboarding flow simplification',
		size: 6
	},
	{
		workload: '3f5c4cc9-3c7d-470e-9253-1e7e451c0827' as ID,
		label: 'saltmarsh_agriculture_energy_efficiency_retrofit',
		name: 'Energy efficiency retrofit',
		size: 9
	},
	{
		workload: 'ebdff0c2-05a0-49eb-a34b-bf13a57599eb' as ID,
		label: 'saltmarsh_agriculture_retail_pos_upgrade',
		name: 'Retail POS upgrade',
		size: 12
	},
	{
		workload: 'b7f9c571-871d-4aff-ac5c-984f1c2ee79d' as ID,
		label: 'saltmarsh_agriculture_knowledge_base_consolidation',
		name: 'Knowledge base consolidation',
		size: 15
	},
	{
		workload: '15eed817-5d89-4b44-aeee-7aa9ec508496' as ID,
		label: 'ironwood_construction_quality_assurance_automation',
		name: 'Quality assurance automation',
		size: 18
	},
	{
		workload: 'd66b1104-3711-46c2-958f-6ea6d84a2fd7' as ID,
		label: 'driftline_apparel_co_international_tax_compliance',
		name: 'International tax compliance',
		size: 21
	},
	{
		workload: '7afa7cd3-7ae8-44c9-b4a3-475de4403d97' as ID,
		label: 'cinderpeak_robotics_customer_churn_analysis',
		name: 'Customer churn analysis',
		size: 4
	},
	{
		workload: '306e9e86-ad07-4a78-9e0c-7c4670c743bd' as ID,
		label: 'cinderpeak_robotics_fleet_electrification_pilot',
		name: 'Fleet electrification pilot',
		size: 7
	},
	{
		workload: 'a3f6c813-a715-461b-9c2f-3c9c07782e27' as ID,
		label: 'mosswood_publishing_document_management_overhaul',
		name: 'Document management overhaul',
		size: 10
	},
	{
		workload: '8e7034e4-78a7-44c3-a05d-73dc4c6e7f9d' as ID,
		label: 'vault_and_key_cybersecurity_site_reliability_initiative',
		name: 'Site reliability initiative',
		size: 13
	},
	{
		workload: 'dd4233b5-492d-41c4-86a9-b79569f37f89' as ID,
		label: 'highmark_furniture_co_marketing_attribution_model',
		name: 'Marketing attribution model',
		size: 16
	},
	{
		workload: 'c311f2ea-f678-4214-bc8c-16c0c2cf4254' as ID,
		label: 'lanternfish_seafood_procurement_platform_rebuild',
		name: 'Procurement platform rebuild',
		size: 19
	},
	{
		workload: '05c032f9-f994-4e89-876e-6862a5a64323' as ID,
		label: 'crestline_motors_workforce_scheduling_system',
		name: 'Workforce scheduling system',
		size: 2
	},
	{
		workload: 'a3bcd48f-dc02-44a7-9bba-86099eb063ed' as ID,
		label: 'crestline_motors_product_catalog_migration',
		name: 'Product catalog migration',
		size: 5
	},
	{
		workload: 'd5a7174b-2ea5-4afc-89dc-92a8fe1e1728' as ID,
		label: 'pinegrove_timber_co_disaster_recovery_drill_program',
		name: 'Disaster recovery drill program',
		size: 8
	},
	{
		workload: 'f2c02e19-4d4f-46c3-8ce5-0d6d4b5d3c0c' as ID,
		label: 'aldergate_pharmaceuticals_network_infrastructure_refresh',
		name: 'Network infrastructure refresh',
		size: 11
	}
];

function _search(
	list: Array<Customer | Workload>,
	input: string,
	limit = 10
): Array<Customer | Workload> {
	if ('' === input) return [];

	const options: ufuzzy.Options = { intraMode: 1 };
	const fuzzy = new ufuzzy(options);
	const haystack = list.map((item) => item.name);

	const indexes = fuzzy.filter(haystack, input);
	if (null === indexes) return [];
	const info = fuzzy.info(indexes, haystack, input);
	const order = fuzzy.sort(info, haystack, input);

	// YIKES! This two-level indirection was not at all obvious
	return order
		.map((o) => info.idx[o])
		.map((i) => list[i])
		.slice(0, limit);
}

/**
 *
 * @param duration Milliseconds to wait
 * @param error_probability Probablity it will throw an error. Throws before waits. Defaults to 0.
 * @usage ```
 * 	await delay(200, 0.2)
 * ```
 */
function delay(duration = 200, error_probability = 0) {
	if (Math.random() < error_probability) throw new Error('Random backend error');
	return new Promise((resolve) => setTimeout(resolve, duration));
}

export const db = {
	// node-postgres will throw on things like a constraint violation; callers must catch.
	async execute<Out>(query: string, input: unknown): Promise<Out> {
		await delay(200, 0.2);
		// Ordered most- to least-specific: each prefix is a substring of the next one down.
		const q = query.toLowerCase();
		if (q.startsWith('select customer_workload where like')) {
			return _search([...CUSTOMERS, ...WORKLOADS], input as string) as Out;
		} else if (q.startsWith('select event where')) {
			const id = input as ID;
			const results = EVENTS.filter((event) => id === event.event);
			return (1 === results.length ? results[0] : null) as Out;
		} else if (q.startsWith('select event')) {
			return EVENTS as Out;
		} else if (q.startsWith('insert into event')) {
			const event = Object.assign(input as object, { event: crypto.randomUUID() as ID }) as Event;
			EVENTS.push(event);
			return event as Out;
		} else if (q.startsWith('update event')) {
			const event = input as Event;
			const index = EVENTS.findIndex((e) => e.event === event.event);
			if (index < 0) throw new Error('Event not found'); // Is this right?

			if ('customer' in event && 'object' === typeof event.customer) {
				const found = CUSTOMERS.find((c) => c.customer === event.customer.customer);
				if (undefined === found) throw new ReferenceError(`${event.customer.customer}`);
				event.customer = { customer: found.customer, name: found.name, label: found.label };
			}

			if ('workload' in event && 'object' === typeof event.workload) {
				const found = WORKLOADS.find((w) => w.workload === event.workload.workload);
				if (undefined === found) throw new ReferenceError(`${event.workload.workload}`);
				event.workload = { workload: found.workload, name: found.name, label: found.label };
			}
			EVENTS[index] = event;
			return EVENTS[index] as Out;
		}
		throw new Error(`Not implemented: ${query}`);
	}
};
