<?php
/**
 * Theme Customizer: hero section and contact info
 */

if (!defined('ABSPATH')) { exit; }

add_action('customize_register', function($wp_customize) {
    // Panel
    $wp_customize->add_panel('saraivavision_panel', [
        'title' => __('Saraiva Vision', 'saraivavision'),
        'priority' => 10,
    ]);

    // Hero Section
    $wp_customize->add_section('saraivavision_hero', [
        'title' => __('Herói (Topo)', 'saraivavision'),
        'panel' => 'saraivavision_panel',
    ]);

    $wp_customize->add_setting('hero_title', [
        'default' => __('Clínica Saraiva Vision', 'saraivavision'),
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('hero_title', [
        'label' => __('Título', 'saraivavision'),
        'section' => 'saraivavision_hero',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('hero_subtitle', [
        'default' => __('Oftalmologia com tecnologia avançada em Caratinga/MG.', 'saraivavision'),
        'sanitize_callback' => 'wp_kses_post',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('hero_subtitle', [
        'label' => __('Subtítulo', 'saraivavision'),
        'section' => 'saraivavision_hero',
        'type' => 'textarea',
    ]);

    $wp_customize->add_setting('hero_cta_label', [
        'default' => __('Agendar Consulta', 'saraivavision'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('hero_cta_label', [
        'label' => __('Texto do Botão', 'saraivavision'),
        'section' => 'saraivavision_hero',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('hero_cta_link', [
        'default' => 'https://api.whatsapp.com/send?phone=5533998601427',
        'sanitize_callback' => 'esc_url_raw',
    ]);
    $wp_customize->add_control('hero_cta_link', [
        'label' => __('Link do Botão', 'saraivavision'),
        'section' => 'saraivavision_hero',
        'type' => 'url',
    ]);

    // Contacts
    $wp_customize->add_section('saraivavision_contacts', [
        'title' => __('Contatos', 'saraivavision'),
        'panel' => 'saraivavision_panel',
    ]);

    $wp_customize->add_setting('phone_number', [
        'default' => '+55 33 99860-1427',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('phone_number', [
        'label' => __('Telefone', 'saraivavision'),
        'section' => 'saraivavision_contacts',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('clinic_address', [
        'default' => __('Rua Catarina Maria Passos, 97 – Santa Zita, Caratinga - MG', 'saraivavision'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('clinic_address', [
        'label' => __('Endereço', 'saraivavision'),
        'section' => 'saraivavision_contacts',
        'type' => 'text',
    ]);
});

