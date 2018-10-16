class CloudCircle {

    public id: string;
    public size: number;
    public depth: number;

    /**
     * Y坐标轴
    */
    public mz: number;
    /**
     * X坐标轴
    */
    public rt: number;

    /**
     * 当前物质的质谱比对图
    */
    public images: { name: string }[];
}