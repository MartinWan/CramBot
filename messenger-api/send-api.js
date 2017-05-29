/**
 * Functions to create the objects required for the Facebook Messenger Send-API
 *
 * https://developers.facebook.com/docs/messenger-platform/send-api-reference
 */
exports.quick_reply = function(content_type, title, payload, image_url) {
  return {
    content_type: content_type,
    title: title,
    payload: payload,
    image_url: image_url
  }
}


exports.generic_template = function(elements, sharable, image_aspect_ratio) {
  return {
    template_type: 'generic',
    elements: elements,
    sharable: sharable,
    image_aspect_ratio: image_aspect_ratio
  }
}


exports.button_template = function(text, buttons) {
  return {
    template_type: 'button',
    text: text,
    buttons: buttons
  }
}


exports.list_template = function(top_element_style, elements, buttons) {
  return {
    template_type: 'list',
    top_element_style: top_element_style,
    elements: elements,
    buttons: buttons
  }
}


exports.element = function(title, subtitle, image_url, default_action, buttons) {
  return {
    title: title,
    subtitle: subtitle,
    image_url: image_url,
    default_action: default_action,
    buttons: buttons
  }
}


exports.postback_button = function(title, payload) {
  return {
    type: 'postback',
    title: title,
    payload: payload
  }
}


exports.url_button = function(url, title, webview_height_ratio) {
  return {
    type: "web_url",
    url: url,
    "webview_height_ratio": webview_height_ratio,
    title: title
  }
}