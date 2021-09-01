type value = string | number | boolean;

export function diffJSON(oldJSON: any, newJSON: any): string {
  let [message, _] = diffObject(oldJSON, newJSON);
  if (message !== "") {
    message = `\n- Expected\n+ Received${message}`;
  }
  return message;
}

function diffObject(oldObject: any, newObject: any): [string, boolean] {
  let message = "";
  for (const [key, oldValue] of Object.entries(oldObject)) {
    if (!(key in newObject)) {
      message += `\n- ${key}: ${oldValue}`;
      continue;
    }

    const newValue = newObject[key];
    let [newMessage, directValuesAreWrong] = diffValues(oldValue, newValue);
    if (directValuesAreWrong) {
      message += newMessage;
      message += `\n- ${key}: ${oldValue}`;
      message += `\n+ ${key}: ${newValue}`;
    } else if (newMessage !== "") {
      message += `\n${key}:${newMessage}`;
    }
  }

  for (const [key, newValue] of Object.entries(newObject)) {
    if (!(key in oldObject)) {
      message += `\n+ ${key}: ${newValue}`;
    }
  }

  if (message !== "") {
    message = appendWhitespace(message);
    message = `\n{${message}\n}`;
  }
  return [message, false];
}

function diffArray(oldArray: Array<any>, newArray: Array<any>): [string, boolean] {
  let message = "";
  let hasDirectDifference = false;
  if (oldArray.length !== newArray.length) {
    return ["", true];
  }

  for (const [index, oldValue] of oldArray.entries()) {
    const newValue = newArray[index];
    let [newMessage, directValuesAreWrong] = diffValues(oldValue, newValue);
    message += newMessage;
    if (directValuesAreWrong) {
      hasDirectDifference = true;
    }
  }

  if (message !== "") {
    message = appendWhitespace(message);
    message = `\n[${message}\n]`;
  }
  return [message, hasDirectDifference];
}

function diffValues(oldValue: any, newValue: any): [string, boolean] {
  if (Array.isArray(oldValue)) {
    return diffArray(oldValue, newValue);
  } else if (typeof oldValue === "object") {
    return diffObject(oldValue, newValue);
  } else {
    return ["", compareValues(oldValue as value, newValue as value)];
  }
}

function compareValues(oldValue: value, newValue: value): boolean {
  if (oldValue === "*" || newValue === "*") {
    return false;
  }
  return oldValue !== newValue;
}

function appendWhitespace(message: string): string {
  return message.replace(/\n/g, "\n  ");
}
