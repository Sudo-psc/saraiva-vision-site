<?php
/**
 * Saraiva Vision Theme Functions
 */

if (!defined('ABSPATH')) { exit; }

// Enqueue styles and scripts
add_action('wp_enqueue_scripts', function() {
    $ver = wp_get_theme()->get('Version');

    // Google Fonts: Inter, Sora, Outfit
    wp_enqueue_style(
        'saraivavision-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@600;700&family=Outfit:wght@700&display=swap',
        [],
        null
    );

    // Main theme stylesheet
    wp_enqueue_style(
        'saraivavision-style',
        get_stylesheet_uri(),
        ['saraivavision-fonts'],
        $ver
    );
});

// Theme setup
add_action('after_setup_theme', function() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', [
        'height' => 64,
        'width'  => 64,
        'flex-width' => true,
        'flex-height' => true,
    ]);
    add_theme_support('html5', ['search-form','comment-form','comment-list','gallery','caption','style','script']);
    add_theme_support('automatic-feed-links');
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');

    register_nav_menus([
        'primary' => __('Menu Principal', 'saraivavision'),
        'footer'  => __('Menu Rodapé', 'saraivavision'),
    ]);
});

// Widgets (optional simple footer area)
add_action('widgets_init', function(){
    register_sidebar([
        'name'          => __('Rodapé 1', 'saraivavision'),
        'id'            => 'footer-1',
        'before_widget' => '<section class="widget">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="footer-heading">',
        'after_title'   => '</h3>',
    ]);
    register_sidebar([
        'name'          => __('Rodapé 2', 'saraivavision'),
        'id'            => 'footer-2',
        'before_widget' => '<section class="widget">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="footer-heading">',
        'after_title'   => '</h3>',
    ]);
});

// Customizer options (hero + contacts)
require_once get_template_directory() . '/inc/customizer.php';

