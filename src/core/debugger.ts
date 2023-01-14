export const Debugger = (() => {
  let instance: Debugger;

  const Debugger = (): Debugger => {
    let context: CanvasRenderingContext2D;

    let debugSections: Array<{ name: string, values: Array<{ name: string, value: any }> }> = [];

    const doesIndexExist = <T>(array: Array<T>, predicate: (value: T) => boolean): boolean => array.findIndex(predicate) !== -1;

    const drawDebug = (): void => {

    };

    return {
      addDebugSection: (name: string): number => {
        if (doesIndexExist(debugSections, (section) => section.name === name)) {
          throw new Error(`Debug section with name ${name} already exists`);
        }

        return debugSections.push({ name, values: [] });
      },

      addValue: (sectionName: string, value: any): number => {
        if (!doesIndexExist(debugSections, (section) => section.name === sectionName))
          throw new Error(`Debug section with name ${sectionName} does not exist`);

        return debugSections.find((section) => section.name === sectionName)!.values.push(value);
      },

      drawDebug: (): void => drawDebug(),

      removeDebugSection: (name: string): number => {
        if (!doesIndexExist(debugSections, (section) => section.name === name))
          throw new Error(`Debug section with name ${name} does not exist`);


        return debugSections.splice(debugSections.findIndex((section) => section.name === name), 1).length;
      },

      removeValue: (sectionName: string, value: any): number => {
        const sectionIndex = debugSections.findIndex((section) => section.name === sectionName);

        if (sectionIndex === -1) throw new Error(`Debug section with name ${sectionName} does not exist`);

        const valueIndex = debugSections[sectionIndex].values.findIndex((val) => val === value);

        if (valueIndex === -1) throw new Error(`Value ${value} does not exist in debug section ${sectionName}`);

        return debugSections[sectionIndex].values.splice(valueIndex, 1).length;
      },

      setContext: (ctx: CanvasRenderingContext2D): void => { context = ctx; },

    }
  };

  return {
    getInstance: (): Debugger => instance || (instance = Debugger())
  }

})();
