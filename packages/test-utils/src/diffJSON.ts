type value = string | number | boolean;

export function diffJSON(oldJSON: any, newJSON: any): void {
  const [message, _] = diffObject(oldJSON, newJSON);
  if (message !== "") {
    console.log(message);
  }
}

function diffObject(oldObject: any, newObject: any): [string, boolean] {
  let message = "";
  for (const [key, oldValue] of Object.entries(oldObject)) {
    if (!(key in newObject)) {
      message += `\nExpected key missing: ${key}: ${oldValue}`;
      continue;
    }
    const newValue = newObject[key];
    let [newMessage, directValuesAreWrong] = diffValues(oldValue, newValue);
    if (directValuesAreWrong) {
      message += newMessage;
      message += `\nExpected: ${key}: ${oldValue}`;
      message += `\nGot:      ${key}: ${newValue}`;
    } else if (newMessage !== "") {
      message += `\n${key}: ${newMessage}`;
    }
  }
  //TODO if newObject has more keys
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
  if ((typeof oldValue === "string" && oldValue === "*") || (typeof newValue === "string" && newValue === "*")) {
    return false;
  }
  if (oldValue !== newValue) {
    return true;
  }
  return false;
}

function appendWhitespace(message: string): string {
  return message.replace(/\n/g, "\n  ");
}
