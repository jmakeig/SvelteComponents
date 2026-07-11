import type { Event, ID } from '$lib/entities';
import { Validation, type Validated } from '$components/FormControl/validation';
import { validate_event } from '$lib/entities';
import ufuzzy from '@leeoniya/ufuzzy';

const ENTITIES: Array<CustomerWorkload> = [
	{
		type: 'customer',
		name: 'Northwind Analytics',
		label: 'northwind_analytics',
		value: '6b47e099-e412-4de5-a2c2-af570a5131a0'
	},
	{
		type: 'customer',
		name: 'Brightfield Logistics',
		label: 'brightfield_logistics',
		value: 'de77dd4e-fc4f-4bc6-a756-16e16f38a342'
	},
	{
		type: 'customer',
		name: 'Cobalt Ridge Energy',
		label: 'cobalt_ridge_energy',
		value: '87ea5331-5ee8-4b06-a07e-962206c5e559'
	},
	{
		type: 'customer',
		name: 'Verdant Foods Co',
		label: 'verdant_foods_co',
		value: 'ab079df2-d638-43e7-9582-5460dd797492'
	},
	{
		type: 'customer',
		name: 'Halcyon Biotech',
		label: 'halcyon_biotech',
		value: '3e1b97cc-2b1f-4aaa-9d39-049f711364fd'
	},
	{
		type: 'customer',
		name: 'Ironclad Security Systems',
		label: 'ironclad_security_systems',
		value: '1e9ea0f7-10ff-4c77-9084-db5e3db289b1'
	},
	{
		type: 'customer',
		name: 'Lumen Optics Group',
		label: 'lumen_optics_group',
		value: 'fcac0d47-6cc4-4236-9683-84e6ef4c2aae'
	},
	{
		type: 'customer',
		name: 'Sable & Pine Furnishings',
		label: 'sable_and_pine_furnishings',
		value: 'ff7d3b89-c653-460b-b1e9-7aef5d3ca901'
	},
	{
		type: 'customer',
		name: 'Quartzline Materials',
		label: 'quartzline_materials',
		value: '8435b315-502d-4733-b856-92f92813f5a5'
	},
	{
		type: 'customer',
		name: 'Driftwood Media',
		label: 'driftwood_media',
		value: '83ed2860-c066-43c6-a67d-7e6cb162743a'
	},
	{
		type: 'customer',
		name: 'Pinnacle Freight Co',
		label: 'pinnacle_freight_co',
		value: '998e33c2-e657-4662-89fd-601025559ee7'
	},
	{
		type: 'customer',
		name: 'Stonebridge Capital',
		label: 'stonebridge_capital',
		value: '76b267b3-8308-473b-a4ec-d1bf2008e4b2'
	},
	{
		type: 'customer',
		name: 'Wrenfield Insurance',
		label: 'wrenfield_insurance',
		value: '70a9bcf0-c0cc-4f13-9c2e-f3642a3244b4'
	},
	{
		type: 'customer',
		name: 'Tidewater Marine Supply',
		label: 'tidewater_marine_supply',
		value: 'c7a52c3c-e350-40a1-a8b7-e0957bf5eed3'
	},
	{
		type: 'customer',
		name: 'Cascadia Renewables',
		label: 'cascadia_renewables',
		value: 'b80ea7bc-49f7-4be0-b036-a5df1413831a'
	},
	{
		type: 'customer',
		name: 'Granite Hollow Mining',
		label: 'granite_hollow_mining',
		value: '07ea4829-acb3-4889-8db5-dc78fa7f13c6'
	},
	{
		type: 'customer',
		name: 'Birchwood Pharmaceuticals',
		label: 'birchwood_pharmaceuticals',
		value: 'f037729b-be76-4d1c-960d-2c7d2ef12be4'
	},
	{
		type: 'customer',
		name: 'Falcon Crest Aerospace',
		label: 'falcon_crest_aerospace',
		value: 'bf53bdce-b1df-466f-9d90-135943c8cd5c'
	},
	{
		type: 'customer',
		name: 'Marrow & Co Design',
		label: 'marrow_and_co_design',
		value: 'f9907b81-409c-446d-ab86-e23da463957b'
	},
	{
		type: 'customer',
		name: 'Outpost Telecom',
		label: 'outpost_telecom',
		value: '9cd111d8-df95-448e-a13e-f0f5cb5d9813'
	},
	{
		type: 'customer',
		name: 'Redwood Civic Bank',
		label: 'redwood_civic_bank',
		value: 'c3c67ade-5be8-4d3c-a670-b5c36abf84d4'
	},
	{
		type: 'customer',
		name: 'Slate Harbor Shipping',
		label: 'slate_harbor_shipping',
		value: '2befdf55-17a7-4099-b717-c4ca9b5d99da'
	},
	{
		type: 'customer',
		name: 'Amberlight Studios',
		label: 'amberlight_studios',
		value: 'b975eee7-1063-42f1-8857-81befbde83a9'
	},
	{
		type: 'customer',
		name: 'Thistledown Apparel',
		label: 'thistledown_apparel',
		value: '6ee6917b-afe2-4567-b551-4e46b6c3d26d'
	},
	{
		type: 'customer',
		name: 'Vantage Point Consulting',
		label: 'vantage_point_consulting',
		value: 'bf5a4ace-1fed-4a73-ba17-464bbfa49467'
	},
	{
		type: 'customer',
		name: 'Copperline Manufacturing',
		label: 'copperline_manufacturing',
		value: '0a8defbe-06e1-4619-b316-e10aeb2c8b65'
	},
	{
		type: 'customer',
		name: 'Hearthstone Realty',
		label: 'hearthstone_realty',
		value: 'bfda9435-0a0f-451a-b2df-d091c09ad0a7'
	},
	{
		type: 'customer',
		name: 'Nimbus Cloud Systems',
		label: 'nimbus_cloud_systems',
		value: 'f574ae96-e08a-4c4a-8020-a4bb78faf39b'
	},
	{
		type: 'customer',
		name: 'Meridian Health Group',
		label: 'meridian_health_group',
		value: 'fe682a0b-4aef-40af-b21e-120d50cb85bc'
	},
	{
		type: 'customer',
		name: 'Foxglove Cosmetics',
		label: 'foxglove_cosmetics',
		value: 'a9f3d49c-ad7c-4864-a5a2-4900b102536f'
	},
	{
		type: 'customer',
		name: 'Ledger & Vine Accounting',
		label: 'ledger_and_vine_accounting',
		value: 'f8105a8f-d318-4993-a8e3-e4320e022af9'
	},
	{
		type: 'customer',
		name: 'Greywolf Defense Corp',
		label: 'greywolf_defense_corp',
		value: '83fc76c4-df45-4205-91a6-90fef01e3f0a'
	},
	{
		type: 'customer',
		name: 'Saltmarsh Agriculture',
		label: 'saltmarsh_agriculture',
		value: 'ce5fa0a9-c5ad-4174-8da5-66739fb1a73e'
	},
	{
		type: 'customer',
		name: 'Brassbound Tools',
		label: 'brassbound_tools',
		value: '6725a71b-1d99-4611-83e8-d7eb62569a37'
	},
	{
		type: 'customer',
		name: 'Echo Valley Records',
		label: 'echo_valley_records',
		value: 'f51bc9bc-e8f2-43e2-a058-5d30d16db131'
	},
	{
		type: 'customer',
		name: 'Ferncrest Hospitality',
		label: 'ferncrest_hospitality',
		value: 'c1be0791-461a-4db3-8297-3a2a0b4b98d6'
	},
	{
		type: 'customer',
		name: 'Ironwood Construction',
		label: 'ironwood_construction',
		value: 'a4617176-4d81-44cd-ac1e-4f3353c75983'
	},
	{
		type: 'customer',
		name: 'Driftline Apparel Co',
		label: 'driftline_apparel_co',
		value: '6482c3ab-ab0f-47b8-8512-6d3bee054feb'
	},
	{
		type: 'customer',
		name: 'Cinderpeak Robotics',
		label: 'cinderpeak_robotics',
		value: 'e3c36155-777c-4943-982a-b0b50350099c'
	},
	{
		type: 'customer',
		name: 'Wellspring Water Co',
		label: 'wellspring_water_co',
		value: 'ed197597-79c8-48f2-89b7-f3eb6328d17e'
	},
	{
		type: 'customer',
		name: 'Bramblewood Toys',
		label: 'bramblewood_toys',
		value: 'c9a7f75f-f931-4f46-ae0b-53d88adeb31d'
	},
	{
		type: 'customer',
		name: 'Solstice Power Grid',
		label: 'solstice_power_grid',
		value: 'd1593267-a60d-4143-aa19-4543bb6014b2'
	},
	{
		type: 'customer',
		name: 'Anchorpoint Logistics',
		label: 'anchorpoint_logistics',
		value: '86f06d5a-d17c-4a1e-bc37-6eaf38c0ae92'
	},
	{
		type: 'customer',
		name: 'Mosswood Publishing',
		label: 'mosswood_publishing',
		value: 'e66a7231-0881-4f16-ad13-1124a4975881'
	},
	{
		type: 'customer',
		name: 'Vault & Key Cybersecurity',
		label: 'vault_and_key_cybersecurity',
		value: '18a5547f-171d-45ba-9e11-5508ffca30e3'
	},
	{
		type: 'customer',
		name: 'Highmark Furniture Co',
		label: 'highmark_furniture_co',
		value: '25f529a0-c2f1-4f91-96c1-92fa9e5db79f'
	},
	{
		type: 'customer',
		name: 'Lanternfish Seafood',
		label: 'lanternfish_seafood',
		value: 'a0082bce-82e0-42db-b0ba-16697c77c55d'
	},
	{
		type: 'customer',
		name: 'Crestline Motors',
		label: 'crestline_motors',
		value: '71251deb-6d98-41a6-8d3f-3ee395c41a78'
	},
	{
		type: 'customer',
		name: 'Pinegrove Timber Co',
		label: 'pinegrove_timber_co',
		value: '7531b415-ca8f-4541-bc5c-effd892935ad'
	},
	{
		type: 'customer',
		name: 'Aldergate Pharmaceuticals',
		label: 'aldergate_pharmaceuticals',
		value: '921b1085-8a48-4fce-b9fe-f2a0fc75905f'
	},
	{
		type: 'workload',
		name: 'Customer portal redesign',
		label: 'brightfield_logistics_customer_portal_redesign',
		value: 'ad060232-8b52-4ada-b6b4-eb64f0a1c0e9',
		ref: {
			type: 'customer',
			name: 'Brightfield Logistics',
			label: 'brightfield_logistics',
			value: 'de77dd4e-fc4f-4bc6-a756-16e16f38a342'
		}
	},
	{
		type: 'workload',
		name: 'Q3 supply chain audit',
		label: 'verdant_foods_co_q3_supply_chain_audit',
		value: '86114daf-5d32-4509-a69d-fb9bba43be92',
		ref: {
			type: 'customer',
			name: 'Verdant Foods Co',
			label: 'verdant_foods_co',
			value: 'ab079df2-d638-43e7-9582-5460dd797492'
		}
	},
	{
		type: 'workload',
		name: 'Inventory tracking rollout',
		label: 'halcyon_biotech_inventory_tracking_rollout',
		value: '32e160bb-1822-4a0a-832a-6050c49f326d',
		ref: {
			type: 'customer',
			name: 'Halcyon Biotech',
			label: 'halcyon_biotech',
			value: '3e1b97cc-2b1f-4aaa-9d39-049f711364fd'
		}
	},
	{
		type: 'workload',
		name: 'Mobile app v2 launch',
		label: 'halcyon_biotech_mobile_app_v2_launch',
		value: '431d0889-939c-4627-a44f-8dd10bc935bd',
		ref: {
			type: 'customer',
			name: 'Halcyon Biotech',
			label: 'halcyon_biotech',
			value: '3e1b97cc-2b1f-4aaa-9d39-049f711364fd'
		}
	},
	{
		type: 'workload',
		name: 'Data warehouse migration',
		label: 'halcyon_biotech_data_warehouse_migration',
		value: '05fa343f-2216-4dd4-a491-c93fcbde7bf1',
		ref: {
			type: 'customer',
			name: 'Halcyon Biotech',
			label: 'halcyon_biotech',
			value: '3e1b97cc-2b1f-4aaa-9d39-049f711364fd'
		}
	},
	{
		type: 'workload',
		name: 'Carbon footprint initiative',
		label: 'lumen_optics_group_carbon_footprint_initiative',
		value: 'edc90149-a0ea-4fc0-b845-5dec96582454',
		ref: {
			type: 'customer',
			name: 'Lumen Optics Group',
			label: 'lumen_optics_group',
			value: 'fcac0d47-6cc4-4236-9683-84e6ef4c2aae'
		}
	},
	{
		type: 'workload',
		name: 'Vendor onboarding overhaul',
		label: 'lumen_optics_group_vendor_onboarding_overhaul',
		value: '30c7c30e-a2d7-41c7-bfda-14ea686229e3',
		ref: {
			type: 'customer',
			name: 'Lumen Optics Group',
			label: 'lumen_optics_group',
			value: 'fcac0d47-6cc4-4236-9683-84e6ef4c2aae'
		}
	},
	{
		type: 'workload',
		name: 'Fraud detection upgrade',
		label: 'sable_and_pine_furnishings_fraud_detection_upgrade',
		value: '04775c4d-cd5d-4983-a766-ce33048cdaa3',
		ref: {
			type: 'customer',
			name: 'Sable & Pine Furnishings',
			label: 'sable_and_pine_furnishings',
			value: 'ff7d3b89-c653-460b-b1e9-7aef5d3ca901'
		}
	},
	{
		type: 'workload',
		name: 'Employee wellness program',
		label: 'sable_and_pine_furnishings_employee_wellness_program',
		value: '0a85062c-759c-435a-9d0f-55a2af90fe61',
		ref: {
			type: 'customer',
			name: 'Sable & Pine Furnishings',
			label: 'sable_and_pine_furnishings',
			value: 'ff7d3b89-c653-460b-b1e9-7aef5d3ca901'
		}
	},
	{
		type: 'workload',
		name: 'Regional expansion study',
		label: 'stonebridge_capital_regional_expansion_study',
		value: '98e677d7-5b01-4082-b9e3-44de13ad5d11',
		ref: {
			type: 'customer',
			name: 'Stonebridge Capital',
			label: 'stonebridge_capital',
			value: '76b267b3-8308-473b-a4ec-d1bf2008e4b2'
		}
	},
	{
		type: 'workload',
		name: 'API gateway modernization',
		label: 'stonebridge_capital_api_gateway_modernization',
		value: 'fd18edac-c447-4ccf-8d83-b0b90bdc316e',
		ref: {
			type: 'customer',
			name: 'Stonebridge Capital',
			label: 'stonebridge_capital',
			value: '76b267b3-8308-473b-a4ec-d1bf2008e4b2'
		}
	},
	{
		type: 'workload',
		name: 'Payroll system migration',
		label: 'cascadia_renewables_payroll_system_migration',
		value: '830132ac-0111-4d4d-be91-85570edb6258',
		ref: {
			type: 'customer',
			name: 'Cascadia Renewables',
			label: 'cascadia_renewables',
			value: 'b80ea7bc-49f7-4be0-b036-a5df1413831a'
		}
	},
	{
		type: 'workload',
		name: 'Brand refresh campaign',
		label: 'birchwood_pharmaceuticals_brand_refresh_campaign',
		value: 'a14ccdeb-4129-441d-851b-1ab83e9867de',
		ref: {
			type: 'customer',
			name: 'Birchwood Pharmaceuticals',
			label: 'birchwood_pharmaceuticals',
			value: 'f037729b-be76-4d1c-960d-2c7d2ef12be4'
		}
	},
	{
		type: 'workload',
		name: 'Cold storage expansion',
		label: 'falcon_crest_aerospace_cold_storage_expansion',
		value: 'a0311e56-0abe-44e0-87ac-668ebe81507a',
		ref: {
			type: 'customer',
			name: 'Falcon Crest Aerospace',
			label: 'falcon_crest_aerospace',
			value: 'bf53bdce-b1df-466f-9d90-135943c8cd5c'
		}
	},
	{
		type: 'workload',
		name: 'Predictive maintenance pilot',
		label: 'falcon_crest_aerospace_predictive_maintenance_pilot',
		value: '7d39ecc6-c5fd-4527-8c81-64e3d9b69405',
		ref: {
			type: 'customer',
			name: 'Falcon Crest Aerospace',
			label: 'falcon_crest_aerospace',
			value: 'bf53bdce-b1df-466f-9d90-135943c8cd5c'
		}
	},
	{
		type: 'workload',
		name: 'Customer loyalty platform',
		label: 'outpost_telecom_customer_loyalty_platform',
		value: '29b98a62-095f-4c46-9146-e0c43e58fb82',
		ref: {
			type: 'customer',
			name: 'Outpost Telecom',
			label: 'outpost_telecom',
			value: '9cd111d8-df95-448e-a13e-f0f5cb5d9813'
		}
	},
	{
		type: 'workload',
		name: 'Internal tooling consolidation',
		label: 'redwood_civic_bank_internal_tooling_consolidation',
		value: '5c040725-82ba-4ba4-aa6d-ec8a9750c3a0',
		ref: {
			type: 'customer',
			name: 'Redwood Civic Bank',
			label: 'redwood_civic_bank',
			value: 'c3c67ade-5be8-4d3c-a670-b5c36abf84d4'
		}
	},
	{
		type: 'workload',
		name: 'Cybersecurity hardening sprint',
		label: 'redwood_civic_bank_cybersecurity_hardening_sprint',
		value: 'ca040012-9717-4306-bf20-e937de26c9ba',
		ref: {
			type: 'customer',
			name: 'Redwood Civic Bank',
			label: 'redwood_civic_bank',
			value: 'c3c67ade-5be8-4d3c-a670-b5c36abf84d4'
		}
	},
	{
		type: 'workload',
		name: 'Sustainability reporting tool',
		label: 'redwood_civic_bank_sustainability_reporting_tool',
		value: 'f8c91d36-c111-420f-9a5f-88eb0b6b115d',
		ref: {
			type: 'customer',
			name: 'Redwood Civic Bank',
			label: 'redwood_civic_bank',
			value: 'c3c67ade-5be8-4d3c-a670-b5c36abf84d4'
		}
	},
	{
		type: 'workload',
		name: 'Warehouse automation pilot',
		label: 'amberlight_studios_warehouse_automation_pilot',
		value: 'fd17e0c4-2a81-460a-85dd-118ed3e472b0',
		ref: {
			type: 'customer',
			name: 'Amberlight Studios',
			label: 'amberlight_studios',
			value: 'b975eee7-1063-42f1-8857-81befbde83a9'
		}
	},
	{
		type: 'workload',
		name: 'Pricing model overhaul',
		label: 'amberlight_studios_pricing_model_overhaul',
		value: '023c289c-9fa2-4a3c-861d-fdd064558cb7',
		ref: {
			type: 'customer',
			name: 'Amberlight Studios',
			label: 'amberlight_studios',
			value: 'b975eee7-1063-42f1-8857-81befbde83a9'
		}
	},
	{
		type: 'workload',
		name: 'Talent acquisition platform',
		label: 'thistledown_apparel_talent_acquisition_platform',
		value: '7f47bfa0-1955-47da-a8a0-ab6633acd21c',
		ref: {
			type: 'customer',
			name: 'Thistledown Apparel',
			label: 'thistledown_apparel',
			value: '6ee6917b-afe2-4567-b551-4e46b6c3d26d'
		}
	},
	{
		type: 'workload',
		name: 'Cloud cost optimization',
		label: 'thistledown_apparel_cloud_cost_optimization',
		value: 'fe6ac4f6-2158-47fa-ac42-b6d56d009b6e',
		ref: {
			type: 'customer',
			name: 'Thistledown Apparel',
			label: 'thistledown_apparel',
			value: '6ee6917b-afe2-4567-b551-4e46b6c3d26d'
		}
	},
	{
		type: 'workload',
		name: 'Field service app rebuild',
		label: 'thistledown_apparel_field_service_app_rebuild',
		value: '4ae71911-fb39-4f4f-93ef-5805ee885ebe',
		ref: {
			type: 'customer',
			name: 'Thistledown Apparel',
			label: 'thistledown_apparel',
			value: '6ee6917b-afe2-4567-b551-4e46b6c3d26d'
		}
	},
	{
		type: 'workload',
		name: 'Compliance documentation push',
		label: 'vantage_point_consulting_compliance_documentation_push',
		value: 'd98fa71f-0637-4a53-994c-1f87f9fd07ee',
		ref: {
			type: 'customer',
			name: 'Vantage Point Consulting',
			label: 'vantage_point_consulting',
			value: 'bf5a4ace-1fed-4a73-ba17-464bbfa49467'
		}
	},
	{
		type: 'workload',
		name: 'Real-time analytics dashboard',
		label: 'vantage_point_consulting_real_time_analytics_dashboard',
		value: '3c07c83a-8857-4390-b1d9-bdf96e0d32fc',
		ref: {
			type: 'customer',
			name: 'Vantage Point Consulting',
			label: 'vantage_point_consulting',
			value: 'bf5a4ace-1fed-4a73-ba17-464bbfa49467'
		}
	},
	{
		type: 'workload',
		name: 'Legacy system decommission',
		label: 'nimbus_cloud_systems_legacy_system_decommission',
		value: '672ea8eb-9233-4af0-9265-e007e2aaf04b',
		ref: {
			type: 'customer',
			name: 'Nimbus Cloud Systems',
			label: 'nimbus_cloud_systems',
			value: 'f574ae96-e08a-4c4a-8020-a4bb78faf39b'
		}
	},
	{
		type: 'workload',
		name: 'Multi-region failover setup',
		label: 'meridian_health_group_multi_region_failover_setup',
		value: '3f4d4571-02bf-48a6-9bf5-8e8cc44449ca',
		ref: {
			type: 'customer',
			name: 'Meridian Health Group',
			label: 'meridian_health_group',
			value: 'fe682a0b-4aef-40af-b21e-120d50cb85bc'
		}
	},
	{
		type: 'workload',
		name: 'Subscription billing revamp',
		label: 'meridian_health_group_subscription_billing_revamp',
		value: '3e4e9f10-4dff-4766-a494-022fa210e748',
		ref: {
			type: 'customer',
			name: 'Meridian Health Group',
			label: 'meridian_health_group',
			value: 'fe682a0b-4aef-40af-b21e-120d50cb85bc'
		}
	},
	{
		type: 'workload',
		name: 'Partner integration program',
		label: 'meridian_health_group_partner_integration_program',
		value: 'e4b2d68b-c024-4ac5-be24-7dd7af5819a4',
		ref: {
			type: 'customer',
			name: 'Meridian Health Group',
			label: 'meridian_health_group',
			value: 'fe682a0b-4aef-40af-b21e-120d50cb85bc'
		}
	},
	{
		type: 'workload',
		name: 'Accessibility compliance audit',
		label: 'foxglove_cosmetics_accessibility_compliance_audit',
		value: '136d7ea6-2499-41d0-89cb-b42d46e516d1',
		ref: {
			type: 'customer',
			name: 'Foxglove Cosmetics',
			label: 'foxglove_cosmetics',
			value: 'a9f3d49c-ad7c-4864-a5a2-4900b102536f'
		}
	},
	{
		type: 'workload',
		name: 'Voice-of-customer research',
		label: 'foxglove_cosmetics_voice_of_customer_research',
		value: 'e1184883-ae1d-4101-992d-ed1fc28d0a87',
		ref: {
			type: 'customer',
			name: 'Foxglove Cosmetics',
			label: 'foxglove_cosmetics',
			value: 'a9f3d49c-ad7c-4864-a5a2-4900b102536f'
		}
	},
	{
		type: 'workload',
		name: 'Supply forecasting model',
		label: 'ledger_and_vine_accounting_supply_forecasting_model',
		value: 'b136a075-c13d-4acc-9766-86bccd7c454e',
		ref: {
			type: 'customer',
			name: 'Ledger & Vine Accounting',
			label: 'ledger_and_vine_accounting',
			value: 'f8105a8f-d318-4993-a8e3-e4320e022af9'
		}
	},
	{
		type: 'workload',
		name: 'Data privacy remediation',
		label: 'ledger_and_vine_accounting_data_privacy_remediation',
		value: 'd2bf8d94-c8c1-47aa-9171-9a39a332165e',
		ref: {
			type: 'customer',
			name: 'Ledger & Vine Accounting',
			label: 'ledger_and_vine_accounting',
			value: 'f8105a8f-d318-4993-a8e3-e4320e022af9'
		}
	},
	{
		type: 'workload',
		name: 'Onboarding flow simplification',
		label: 'greywolf_defense_corp_onboarding_flow_simplification',
		value: '94b64800-9de5-4e79-8f9c-c5cb58be448e',
		ref: {
			type: 'customer',
			name: 'Greywolf Defense Corp',
			label: 'greywolf_defense_corp',
			value: '83fc76c4-df45-4205-91a6-90fef01e3f0a'
		}
	},
	{
		type: 'workload',
		name: 'Energy efficiency retrofit',
		label: 'saltmarsh_agriculture_energy_efficiency_retrofit',
		value: '3f5c4cc9-3c7d-470e-9253-1e7e451c0827',
		ref: {
			type: 'customer',
			name: 'Saltmarsh Agriculture',
			label: 'saltmarsh_agriculture',
			value: 'ce5fa0a9-c5ad-4174-8da5-66739fb1a73e'
		}
	},
	{
		type: 'workload',
		name: 'Retail POS upgrade',
		label: 'saltmarsh_agriculture_retail_pos_upgrade',
		value: 'ebdff0c2-05a0-49eb-a34b-bf13a57599eb',
		ref: {
			type: 'customer',
			name: 'Saltmarsh Agriculture',
			label: 'saltmarsh_agriculture',
			value: 'ce5fa0a9-c5ad-4174-8da5-66739fb1a73e'
		}
	},
	{
		type: 'workload',
		name: 'Knowledge base consolidation',
		label: 'saltmarsh_agriculture_knowledge_base_consolidation',
		value: 'b7f9c571-871d-4aff-ac5c-984f1c2ee79d',
		ref: {
			type: 'customer',
			name: 'Saltmarsh Agriculture',
			label: 'saltmarsh_agriculture',
			value: 'ce5fa0a9-c5ad-4174-8da5-66739fb1a73e'
		}
	},
	{
		type: 'workload',
		name: 'Quality assurance automation',
		label: 'ironwood_construction_quality_assurance_automation',
		value: '15eed817-5d89-4b44-aeee-7aa9ec508496',
		ref: {
			type: 'customer',
			name: 'Ironwood Construction',
			label: 'ironwood_construction',
			value: 'a4617176-4d81-44cd-ac1e-4f3353c75983'
		}
	},
	{
		type: 'workload',
		name: 'International tax compliance',
		label: 'driftline_apparel_co_international_tax_compliance',
		value: 'd66b1104-3711-46c2-958f-6ea6d84a2fd7',
		ref: {
			type: 'customer',
			name: 'Driftline Apparel Co',
			label: 'driftline_apparel_co',
			value: '6482c3ab-ab0f-47b8-8512-6d3bee054feb'
		}
	},
	{
		type: 'workload',
		name: 'Customer churn analysis',
		label: 'cinderpeak_robotics_customer_churn_analysis',
		value: '7afa7cd3-7ae8-44c9-b4a3-475de4403d97',
		ref: {
			type: 'customer',
			name: 'Cinderpeak Robotics',
			label: 'cinderpeak_robotics',
			value: 'e3c36155-777c-4943-982a-b0b50350099c'
		}
	},
	{
		type: 'workload',
		name: 'Fleet electrification pilot',
		label: 'cinderpeak_robotics_fleet_electrification_pilot',
		value: '306e9e86-ad07-4a78-9e0c-7c4670c743bd',
		ref: {
			type: 'customer',
			name: 'Cinderpeak Robotics',
			label: 'cinderpeak_robotics',
			value: 'e3c36155-777c-4943-982a-b0b50350099c'
		}
	},
	{
		type: 'workload',
		name: 'Document management overhaul',
		label: 'mosswood_publishing_document_management_overhaul',
		value: 'a3f6c813-a715-461b-9c2f-3c9c07782e27',
		ref: {
			type: 'customer',
			name: 'Mosswood Publishing',
			label: 'mosswood_publishing',
			value: 'e66a7231-0881-4f16-ad13-1124a4975881'
		}
	},
	{
		type: 'workload',
		name: 'Site reliability initiative',
		label: 'vault_and_key_cybersecurity_site_reliability_initiative',
		value: '8e7034e4-78a7-44c3-a05d-73dc4c6e7f9d',
		ref: {
			type: 'customer',
			name: 'Vault & Key Cybersecurity',
			label: 'vault_and_key_cybersecurity',
			value: '18a5547f-171d-45ba-9e11-5508ffca30e3'
		}
	},
	{
		type: 'workload',
		name: 'Marketing attribution model',
		label: 'highmark_furniture_co_marketing_attribution_model',
		value: 'dd4233b5-492d-41c4-86a9-b79569f37f89',
		ref: {
			type: 'customer',
			name: 'Highmark Furniture Co',
			label: 'highmark_furniture_co',
			value: '25f529a0-c2f1-4f91-96c1-92fa9e5db79f'
		}
	},
	{
		type: 'workload',
		name: 'Procurement platform rebuild',
		label: 'lanternfish_seafood_procurement_platform_rebuild',
		value: 'c311f2ea-f678-4214-bc8c-16c0c2cf4254',
		ref: {
			type: 'customer',
			name: 'Lanternfish Seafood',
			label: 'lanternfish_seafood',
			value: 'a0082bce-82e0-42db-b0ba-16697c77c55d'
		}
	},
	{
		type: 'workload',
		name: 'Workforce scheduling system',
		label: 'crestline_motors_workforce_scheduling_system',
		value: '05c032f9-f994-4e89-876e-6862a5a64323',
		ref: {
			type: 'customer',
			name: 'Crestline Motors',
			label: 'crestline_motors',
			value: '71251deb-6d98-41a6-8d3f-3ee395c41a78'
		}
	},
	{
		type: 'workload',
		name: 'Product catalog migration',
		label: 'crestline_motors_product_catalog_migration',
		value: 'a3bcd48f-dc02-44a7-9bba-86099eb063ed',
		ref: {
			type: 'customer',
			name: 'Crestline Motors',
			label: 'crestline_motors',
			value: '71251deb-6d98-41a6-8d3f-3ee395c41a78'
		}
	},
	{
		type: 'workload',
		name: 'Disaster recovery drill program',
		label: 'pinegrove_timber_co_disaster_recovery_drill_program',
		value: 'd5a7174b-2ea5-4afc-89dc-92a8fe1e1728',
		ref: {
			type: 'customer',
			name: 'Pinegrove Timber Co',
			label: 'pinegrove_timber_co',
			value: '7531b415-ca8f-4541-bc5c-effd892935ad'
		}
	},
	{
		type: 'workload',
		name: 'Network infrastructure refresh',
		label: 'aldergate_pharmaceuticals_network_infrastructure_refresh',
		value: 'f2c02e19-4d4f-46c3-8ce5-0d6d4b5d3c0c',
		ref: {
			type: 'customer',
			name: 'Aldergate Pharmaceuticals',
			label: 'aldergate_pharmaceuticals',
			value: '921b1085-8a48-4fce-b9fe-f2a0fc75905f'
		}
	}
];

const EVENTS: Array<Event> = [];

const db = {
	// node-postgres will throw on things like a constraint violation; callers must catch.
	async execute<T>(query: string, input: T): Promise<T> {
		if (query.toLowerCase().startsWith('insert into event')) {
			const event = Object.assign(input as object, { event: crypto.randomUUID() as ID }) as T;
			EVENTS.push(event as Event);
			return event;
		} else if (query.toLowerCase().startsWith('update event')) {
			const event = input as Event;
			const index = EVENTS.findIndex((e) => event.event === event.event);

			if ('customer' in event && 'object' === typeof event.customer) {
				const ref = ENTITIES.find(
					(ent) => 'customer' === ent.type && ent.value === event.customer.customer
				);
				if (undefined === ref) throw new ReferenceError(`${event.customer.customer}`);
				event.customer = {
					customer: ref.value as ID,
					label: ref.label,
					name: ref.name
				};
			}

			if ('workload' in event && 'object' === typeof event.workload) {
				const ref = ENTITIES.find(
					(ent) => 'workload' === ent.type && ent.value === event.workload.workload
				);
				if (undefined === ref) throw new ReferenceError(`${event.workload.workload}`);
				event.workload = {
					workload: ref.value as ID,
					label: ref.label,
					name: ref.name
				};
			}
			console.log(event);
			if (index > -1) {
				EVENTS[index] = input as Event;
				return EVENTS[index] as T;
			}
			throw new Error('Event not found');
		}
		throw new Error(`Not implemented: ${query}`);
	}
};

export async function get_events(): Promise<Array<Event>> {
	return Promise.resolve(EVENTS);
}

export async function get_event(id: ID): Promise<Event | null> {
	const results = EVENTS.filter((event) => id === event.event);
	if (1 === results.length) return results[0];
	return null;
}

export async function create_event(pending: unknown): Promise<Validated<Event>> {
	const result = validate_event(pending, true);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute('INSERT INTO event', result.data) };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}

export async function update_event(pending: unknown): Promise<Validated<Event>> {
	const result = validate_event(pending, false);
	if (result.validation) {
		return result;
	}
	try {
		return { data: await db.execute('UPDATE event', result.data) };
	} catch (db_error) {
		const validation = new Validation<Event>();
		validation.add(db_error instanceof Error ? db_error.message : 'db_error');
		return { data: result.data, validation };
	}
}

interface CustomerWorkload {
	type: 'customer' | 'workload';
	name: string;
	label: string;
	value: string;
	ref?: CustomerWorkload; // Really only workload, but let’s get over this hump
}

function _search(
	list: Array<CustomerWorkload>,
	input: string,
	limit = 10
): Array<CustomerWorkload> {
	if ('' === input) return [];

	const options: ufuzzy.Options = { intraMode: 1 };
	const fuzzy = new ufuzzy(options);
	const haystack = list.map((item) =>
		item.type === 'workload' ? `${item.name}\t${item.ref?.name}` : item.name
	);

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

function delay(duration = 200) {
	return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function match_customer_workload(input: string) {
	await delay(120);
	return Promise.resolve(
		_search(ENTITIES, input).map(({ type, name, label, value }) => {
			return { name, label, value: [type, value].join('_') };
		})
	);
}
