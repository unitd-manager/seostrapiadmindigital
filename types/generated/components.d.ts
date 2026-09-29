import type { Schema, Struct } from '@strapi/strapi';

export interface AcfSectionsBannerLayout extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_banner_layout';
  info: {
    displayName: 'Banner Layout';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.menu-item', false>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    highlighted_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    secondary_button: Schema.Attribute.Component<'shared.menu-item', false>;
    stats: Schema.Attribute.Component<'shared.stats', true>;
    title: Schema.Attribute.String;
  };
}

export interface AcfSectionsCommonHeadingSection
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_common_heading_section';
  info: {
    displayName: 'Common Heading Section With CTA';
  };
  attributes: {
    bottom_text: Schema.Attribute.String;
    description: Schema.Attribute.Blocks;
    eyebrow: Schema.Attribute.String;
    highlight_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    seo_reality: Schema.Attribute.Component<'shared.seo-reality', true>;
    template: Schema.Attribute.Enumeration<
      ['seo_reality', 'framework', 'vision_12_months']
    >;
    title: Schema.Attribute.Text;
  };
}

export interface AcfSectionsContactForm extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_contact_forms';
  info: {
    displayName: 'Contact Form';
  };
  attributes: {
    contact_form_title: Schema.Attribute.String;
    cta_link_label: Schema.Attribute.String;
    cta_link_url: Schema.Attribute.String;
    cta_text: Schema.Attribute.String;
    description: Schema.Attribute.Blocks;
    email_placeholder: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    form_footer_note: Schema.Attribute.String;
    get_in_touch_details: Schema.Attribute.Blocks;
    get_in_touch_title: Schema.Attribute.String;
    main_title: Schema.Attribute.String;
    message_placeholder: Schema.Attribute.String;
    name_placeholder: Schema.Attribute.String;
    subject_placeholder: Schema.Attribute.String;
    submit_button_loading_text: Schema.Attribute.String;
    submit_button_text: Schema.Attribute.String;
    success_message: Schema.Attribute.String;
  };
}

export interface AcfSectionsFooterCommonCta extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_footer_common_cta';
  info: {
    displayName: 'Footer Common CTA';
  };
  attributes: {
    bottom_text: Schema.Attribute.String;
    cta_button: Schema.Attribute.Component<'shared.menu-item', false>;
    description: Schema.Attribute.RichText;
    main_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSectionsGridLayout extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_grid_layout';
  info: {
    displayName: 'Grid Layout';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    grid_items: Schema.Attribute.Component<
      'acf-shared.grid-layout-grid-items',
      true
    >;
    main_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSectionsHomeAutomationEdge extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_home_automation_edge';
  info: {
    displayName: 'Home Automation Edge';
  };
  attributes: {
    automation_edge_list: Schema.Attribute.Component<
      'acf-shared.home-automation-edge-automation-edge-list',
      true
    >;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface AcfSectionsHomeAwardWinner extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_home_award_winner';
  info: {
    displayName: 'Home Award Winner';
  };
  attributes: {
    API_ID: Schema.Attribute.String;
    company_name: Schema.Attribute.String;
    copyright: Schema.Attribute.String;
    description: Schema.Attribute.String;
    location: Schema.Attribute.String;
    menu_item: Schema.Attribute.Component<'shared.menu-item', true>;
  };
}

export interface AcfSectionsHomeFeaturedCaseStudy
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_home_featured_case_study';
  info: {
    displayName: 'Home Featured Case Study';
  };
  attributes: {
    bottom_text: Schema.Attribute.String;
    description: Schema.Attribute.Blocks;
    eyebrow: Schema.Attribute.String;
    highlight_title: Schema.Attribute.String;
    pricing_cards: Schema.Attribute.Component<'shared.pricing-cards', true>;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.Text;
  };
}

export interface AcfSectionsHomeKeyHighlights extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_home_key_highlights';
  info: {
    displayName: 'Home Key Highlights';
  };
  attributes: {
    highlight_text: Schema.Attribute.String;
    highlights_list: Schema.Attribute.Component<
      'acf-shared.home-key-highlights-highlights-list',
      true
    >;
    icon: Schema.Attribute.String;
    main_title: Schema.Attribute.Text;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSectionsHomeTestimonialHighlight
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_home_testimonial_highlight';
  info: {
    displayName: 'Home Testimonial Highlight';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    main_title: Schema.Attribute.Text;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    stats: Schema.Attribute.Component<'shared.stats', true>;
    Testimonial_Items: Schema.Attribute.Component<
      'shared.testimonial-items',
      true
    >;
  };
}

export interface AcfSectionsIndustryAiUseCases extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_industry_ai_use_cases';
  info: {
    displayName: 'Industry AI Use Cases';
  };
  attributes: {
    concern_cards: Schema.Attribute.Component<'shared.concern-list', true>;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    highlight_subtext: Schema.Attribute.String;
    highlight_text: Schema.Attribute.String;
    highlight_title: Schema.Attribute.String;
    main_title: Schema.Attribute.Text;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSectionsIndustryHighlightBlock
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_industry_highlight_block';
  info: {
    displayName: 'Industry Highlight Block';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    eyebrow: Schema.Attribute.String;
    highlight_text: Schema.Attribute.String;
    list: Schema.Attribute.Component<
      'acf-shared.industry-highlight-block-list',
      true
    >;
    main_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSectionsSeo extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_seos';
  info: {
    displayName: 'seo';
  };
  attributes: {
    label: Schema.Attribute.String;
    name: Schema.Attribute.String;
    order: Schema.Attribute.Integer;
    placeholder: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    required: Schema.Attribute.Boolean;
    type: Schema.Attribute.Enumeration<['text', 'email', 'url', 'tel']>;
  };
}

export interface AcfSectionsSeoAuditForm extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_seo_audit_forms';
  info: {
    displayName: 'SEO Audit Form';
  };
  attributes: {
    description: Schema.Attribute.String;
    error_message: Schema.Attribute.String;
    main_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    SEO: Schema.Attribute.Component<'acf-sections.seo', true>;
    submit_label: Schema.Attribute.String;
    success_message: Schema.Attribute.String;
  };
}

export interface AcfSectionsSessionItemSections extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_session_item_sections';
  info: {
    displayName: 'Session Item Sections';
  };
  attributes: {
    cta_link_label: Schema.Attribute.String;
    cta_link_url: Schema.Attribute.String;
    cta_text: Schema.Attribute.String;
    description: Schema.Attribute.RichText;
    eyebrow: Schema.Attribute.String;
    main_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    session_tabs: Schema.Attribute.Component<
      'acf-shared.session-item-sections-session-tabs',
      true
    >;
  };
}

export interface AcfSectionsUnmappedLayout extends Struct.ComponentSchema {
  collectionName: 'components_acf_sections_unmapped_layout';
  info: {
    displayName: 'Unmapped Layout';
  };
  attributes: {
    card_title: Schema.Attribute.String;
    delay_points: Schema.Attribute.Component<'shared.delay-points', true>;
    description: Schema.Attribute.RichText;
    highlight_description: Schema.Attribute.Blocks;
    highlight_title: Schema.Attribute.String;
    main_title: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSharedGridLayoutGridItems extends Struct.ComponentSchema {
  collectionName: 'components_acf_shared_grid_layout_grid_items';
  info: {
    displayName: 'Grid Layout Grid Items';
  };
  attributes: {
    icon: Schema.Attribute.String;
    month: Schema.Attribute.String;
    point1: Schema.Attribute.String;
    point2: Schema.Attribute.String;
    point3: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface AcfSharedHomeAutomationEdgeAutomationEdgeList
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_shared_home_automation_edge_aut_8152fc00';
  info: {
    displayName: 'Home Automation Edge Automation Edge List';
  };
  attributes: {
    badge: Schema.Attribute.String;
    button_text: Schema.Attribute.String;
    button_url: Schema.Attribute.String;
    description: Schema.Attribute.Blocks;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface AcfSharedHomeKeyHighlightsHighlightsList
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_shared_home_key_highlights_high_9b953847';
  info: {
    displayName: 'Home Key Highlights Highlights List';
  };
  attributes: {
    icon: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    step_number: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface AcfSharedIndustryHighlightBlockList
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_shared_industry_highlight_block_list';
  info: {
    displayName: 'Industry Highlight Block List';
  };
  attributes: {
    icon: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    text: Schema.Attribute.String;
  };
}

export interface AcfSharedSessionItemSectionsSessionTabs
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_shared_session_item_sections_se_88e01cfa';
  info: {
    displayName: 'Session Item Sections Session Tabs';
  };
  attributes: {
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    sessions: Schema.Attribute.Component<
      'acf-shared.session-item-sections-session-tabs-sessions',
      true
    >;
    tab_title: Schema.Attribute.String;
  };
}

export interface AcfSharedSessionItemSectionsSessionTabsSessions
  extends Struct.ComponentSchema {
  collectionName: 'components_acf_shared_session_item_sections_se_9500f9e1';
  info: {
    displayName: 'Session Item Sections Session Tabs Sessions';
  };
  attributes: {
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    session_description: Schema.Attribute.RichText;
    session_title: Schema.Attribute.String;
  };
}

export interface CaseStudyBlocksBulletItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_blocks_bullet_items';
  info: {
    displayName: 'Bullet Item';
    icon: 'bulletList';
  };
  attributes: {
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    text: Schema.Attribute.String;
  };
}

export interface CaseStudyBlocksMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_blocks_menu_items';
  info: {
    displayName: 'menu_item';
  };
  attributes: {
    nav: Schema.Attribute.String;
    next_link: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface CaseStudyBlocksNumberedItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_blocks_numbered_items';
  info: {
    displayName: 'Numbered Item';
    icon: 'list';
  };
  attributes: {
    description: Schema.Attribute.Text;
    more_link_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Read More'>;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyBlocksPhaseItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_blocks_phase_items';
  info: {
    displayName: 'Phase Item';
    icon: 'layer';
  };
  attributes: {
    closing_text: Schema.Attribute.Text;
    default_active: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    description: Schema.Attribute.Text;
    intro: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'case-study-blocks.bullet-item', true>;
    items_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Key Improvements Included'>;
    phase_label: Schema.Attribute.String & Schema.Attribute.Required;
    phase_title: Schema.Attribute.String & Schema.Attribute.Required;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface CaseStudyBlocksResultStatItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_blocks_result_stat_items';
  info: {
    displayName: 'Result Stat Item';
    icon: 'chart-bubble';
  };
  attributes: {
    badge_label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Result'>;
    badge_text: Schema.Attribute.String;
    closing_text: Schema.Attribute.Text;
    description: Schema.Attribute.Text;
    expanded_content: Schema.Attribute.RichText;
    heading: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    sub_heading: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyBlocksStatItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_blocks_stat_items';
  info: {
    displayName: 'Stat Item';
    icon: 'chart-line';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedConcernList extends Struct.ComponentSchema {
  collectionName: 'components_shared_concern_lists';
  info: {
    displayName: 'concern_list';
  };
  attributes: {
    icon: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SharedDelayPoints extends Struct.ComponentSchema {
  collectionName: 'components_shared_delay_points';
  info: {
    displayName: 'delay_points';
  };
  attributes: {
    point: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SharedFeatureList extends Struct.ComponentSchema {
  collectionName: 'components_shared_feature_lists';
  info: {
    displayName: 'feature_list';
  };
  attributes: {
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SharedMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_menu_items';
  info: {
    displayName: 'Menu Item';
  };
  attributes: {
    label: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    targetBlank: Schema.Attribute.Boolean;
    url: Schema.Attribute.Text;
  };
}

export interface SharedPricingCards extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricing_cards';
  info: {
    displayName: 'pricing_cards';
  };
  attributes: {
    badge: Schema.Attribute.String;
    button: Schema.Attribute.Component<'shared.menu-item', true>;
    duration: Schema.Attribute.String;
    feature_list: Schema.Attribute.Component<'shared.feature-list', true>;
    icon: Schema.Attribute.String;
    price: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String;
    theme: Schema.Attribute.Enumeration<
      ['blue', 'orange', 'purple', 'cyan', 'pink', 'green']
    >;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
  };
  attributes: {};
}

export interface SharedSeoReality extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo_realities';
  info: {
    displayName: 'seo_reality';
  };
  attributes: {
    Description: Schema.Attribute.Blocks;
    icon: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SharedStats extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'stats';
  };
  attributes: {
    label: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    value: Schema.Attribute.String;
  };
}

export interface SharedTestimonialItems extends Struct.ComponentSchema {
  collectionName: 'components_shared_testimonial_items';
  info: {
    displayName: 'Testimonial-Items';
  };
  attributes: {
    avatar: Schema.Attribute.String;
    client_name: Schema.Attribute.String;
    company: Schema.Attribute.String;
    designation: Schema.Attribute.String;
    Publish: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    quote: Schema.Attribute.RichText;
    rating: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'acf-sections.banner-layout': AcfSectionsBannerLayout;
      'acf-sections.common-heading-section': AcfSectionsCommonHeadingSection;
      'acf-sections.contact-form': AcfSectionsContactForm;
      'acf-sections.footer-common-cta': AcfSectionsFooterCommonCta;
      'acf-sections.grid-layout': AcfSectionsGridLayout;
      'acf-sections.home-automation-edge': AcfSectionsHomeAutomationEdge;
      'acf-sections.home-award-winner': AcfSectionsHomeAwardWinner;
      'acf-sections.home-featured-case-study': AcfSectionsHomeFeaturedCaseStudy;
      'acf-sections.home-key-highlights': AcfSectionsHomeKeyHighlights;
      'acf-sections.home-testimonial-highlight': AcfSectionsHomeTestimonialHighlight;
      'acf-sections.industry-ai-use-cases': AcfSectionsIndustryAiUseCases;
      'acf-sections.industry-highlight-block': AcfSectionsIndustryHighlightBlock;
      'acf-sections.seo': AcfSectionsSeo;
      'acf-sections.seo-audit-form': AcfSectionsSeoAuditForm;
      'acf-sections.session-item-sections': AcfSectionsSessionItemSections;
      'acf-sections.unmapped-layout': AcfSectionsUnmappedLayout;
      'acf-shared.grid-layout-grid-items': AcfSharedGridLayoutGridItems;
      'acf-shared.home-automation-edge-automation-edge-list': AcfSharedHomeAutomationEdgeAutomationEdgeList;
      'acf-shared.home-key-highlights-highlights-list': AcfSharedHomeKeyHighlightsHighlightsList;
      'acf-shared.industry-highlight-block-list': AcfSharedIndustryHighlightBlockList;
      'acf-shared.session-item-sections-session-tabs': AcfSharedSessionItemSectionsSessionTabs;
      'acf-shared.session-item-sections-session-tabs-sessions': AcfSharedSessionItemSectionsSessionTabsSessions;
      'case-study-blocks.bullet-item': CaseStudyBlocksBulletItem;
      'case-study-blocks.menu-item': CaseStudyBlocksMenuItem;
      'case-study-blocks.numbered-item': CaseStudyBlocksNumberedItem;
      'case-study-blocks.phase-item': CaseStudyBlocksPhaseItem;
      'case-study-blocks.result-stat-item': CaseStudyBlocksResultStatItem;
      'case-study-blocks.stat-item': CaseStudyBlocksStatItem;
      'shared.concern-list': SharedConcernList;
      'shared.delay-points': SharedDelayPoints;
      'shared.feature-list': SharedFeatureList;
      'shared.menu-item': SharedMenuItem;
      'shared.pricing-cards': SharedPricingCards;
      'shared.seo': SharedSeo;
      'shared.seo-reality': SharedSeoReality;
      'shared.stats': SharedStats;
      'shared.testimonial-items': SharedTestimonialItems;
    }
  }
}
