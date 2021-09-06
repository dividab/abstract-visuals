type value = string | number | boolean;

export function diffJson(oldJSON: any, newJSON: any): string {
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
      message += `\n- ${key}: ${stringify(oldValue)}`;
      continue;
    }

    const newValue = newObject[key];
    let [newMessage, wrongKeyValues] = diffValues(oldValue, newValue);
    if (wrongKeyValues) {
      message += newMessage;
      message += `\n- ${key}: ${stringify(oldValue)}`;
      message += `\n+ ${key}: ${stringify(newValue)}`;
    } else if (newMessage !== "") {
      message += `\n${key}:${newMessage}`;
    }
  }

  for (const [key, newValue] of Object.entries(newObject)) {
    if (!(key in oldObject)) {
      message += `\n+ ${key}: ${stringify(newValue)}`;
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
  let hasDifference = false;
  if (oldArray.length !== newArray.length) {
    return ["", true];
  }

  for (const [index, oldValue] of oldArray.entries()) {
    const newValue = newArray[index];
    let [newMessage, mismatchValues] = diffValues(oldValue, newValue);
    message += newMessage;
    if (mismatchValues) {
      hasDifference = true;
    }
  }

  if (message !== "") {
    message = appendWhitespace(message);
    message = `\n[${message}\n]`;
  }
  return [message, hasDifference];
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
  if (typeof oldValue === "string" && typeof newValue === "string" && oldValue !== newValue) {
    console.log(oldValue, newValue);
  }
  return oldValue !== newValue;
}

function appendWhitespace(message: string): string {
  return message.replace(/\n/g, "\n  ");
}

function stringify(value: any): string {
  if (typeof value === "string") {
    return value;
  }

  const jsonStringified = JSON.stringify(value, null, 2);

  const noQuotesOnKeys = jsonStringified.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
    return match.replace(/"/g, "");
  });

  return noQuotesOnKeys.replace(/"/g, "'");
}
